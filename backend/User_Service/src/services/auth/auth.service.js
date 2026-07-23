import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Op } from 'sequelize';

import {
  generateTokens,
  getRefreshTokenExpiresAt,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../config/jwt.js';
import User from '../../models/User.js';
import UserSession from '../../models/UserSession.js';
import PasswordResetToken from '../../models/user/PasswordResetToken.js';
import OAuthProvider from '../../models/user/OAuthProvider.js';
import sequelize from '../../config/sequelize.js';
import { enqueueUserCreated } from '../../config/outbox.js';
import {
  getRoleByName,
  getApprovalStatusForRole,
  assertUserCanLogin,
  getBearerToken,
} from './shared.service.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../email.service.js';

export { getBearerToken };

const PASSWORD_RESET_EXPIRES_MS = Number(process.env.PASSWORD_RESET_EXPIRES_MS) || 15 * 60 * 1000;
const PASSWORD_RESET_TOKEN_BYTES = 32;

const hashToken = (rawToken) => crypto.createHash('sha256').update(rawToken).digest('hex');

const generateRawResetToken = () => crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');

const normalizeOAuthProviderValue = (provider) => (provider || '').toString().trim().toLowerCase();

const getUserOAuthProviders = async (user) => {
  const userOAuthProviders = await user.getOAuthProviders?.();
  if (Array.isArray(userOAuthProviders) && userOAuthProviders.length) {
    return userOAuthProviders.map((oauthProvider) =>
      normalizeOAuthProviderValue(oauthProvider.provider)
    );
  }

  const providers = await OAuthProvider.findAll({
    where: { user_id: user.id },
    attributes: ['provider'],
  });
  return providers.map((oauthProvider) => normalizeOAuthProviderValue(oauthProvider.provider));
};

const hasOAuthLoginOnly = async (user) => {
  const providers = await getUserOAuthProviders(user);
  if (!providers.length) {
    return false;
  }

  const hasPassword = typeof user.password_hash === 'string' && user.password_hash.length > 0;
  return !hasPassword;
};

export const register = async (body, eventContext = {}) => {
  const { email, password, phone, full_name, fullName, role, userType } = body;

  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedRole = (role || userType || 'student').toLowerCase();
  const name = full_name || fullName;

  if (!normalizedEmail || !password || !name) {
    const error = new Error('email, password and full_name are required');
    error.status = 400;
    throw error;
  }

  if (!['student', 'teacher'].includes(normalizedRole)) {
    const error = new Error('role must be student or teacher');
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email: normalizedEmail }, ...(phone ? [{ phone }] : [])],
    },
  });

  if (existingUser) {
    const error = new Error('Email or phone already exists');
    error.status = 409;
    throw error;
  }

  const userRole = await getRoleByName(normalizedRole);
  const approvalStatus = getApprovalStatusForRole(userRole.name);
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10);

  return sequelize.transaction(async (transaction) => {
    const user = await User.create(
      {
        email: normalizedEmail,
        phone: phone || null,
        password_hash: passwordHash,
        full_name: name,
        role_id: userRole.id,
        is_active: true,
        email_verified: false,
        approval_status: approvalStatus,
        approved_at: approvalStatus === 'approved' ? new Date() : null,
      },
      { transaction }
    );

    await enqueueUserCreated(
      {
        id: user.id,
        role: userRole.name,
        approvalStatus,
        emailVerified: user.email_verified,
        registrationMethod: 'password',
      },
      eventContext,
      transaction
    );

    return {
      user,
      userRole,
      approvalStatus,
    };
  });
};

export const login = async (body) => {
  const { email, phone, identifier, password } = body;
  const rawLoginId = email || phone || identifier;
  const loginId = rawLoginId?.trim().toLowerCase();

  if (!loginId || !password) {
    const error = new Error('email or phone and password are required');
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: loginId }, { phone: loginId }],
    },
  });

  assertUserCanLogin(user);

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  return { user };
};

export const refreshTokens = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('refreshToken is required');
    error.status = 400;
    throw error;
  }

  const decoded = verifyRefreshToken(refreshToken);

  const session = await UserSession.findOne({
    where: {
      user_id: decoded.id,
      refresh_token: refreshToken,
      is_active: true,
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!session) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  const user = await User.findByPk(decoded.id);
  assertUserCanLogin(user);

  const { getUserRole } = await import('./shared.service.js');
  const role = await getUserRole(user);
  const tokens = generateTokens({
    id: user.id,
    email: user.email,
    role_id: user.role_id,
    role: role ? { name: role.name } : null,
  });

  await session.update({
    refresh_token: tokens.refreshToken,
    expires_at: getRefreshTokenExpiresAt(),
    last_activity: new Date(),
  });

  return {
    tokens,
    user,
    role,
  };
};

export const logout = async (refreshToken) => {
  if (refreshToken) {
    await UserSession.update(
      { is_active: false, last_activity: new Date() },
      { where: { refresh_token: refreshToken } }
    );
  }
  return { success: true };
};

export const getMe = async (req) => {
  const token = getBearerToken(req);
  if (!token) {
    const error = new Error('Missing bearer token');
    error.status = 401;
    throw error;
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findByPk(decoded.id);
  assertUserCanLogin(user);

  const { getUserRole, toPublicUser } = await import('./shared.service.js');
  const role = await getUserRole(user);

  return {
    user: toPublicUser(user, role),
  };
};

export const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    const error = new Error('email is required');
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    // Return success even if user not found (security best practice)
    return { requested: true, message: 'If an account exists, a reset link has been sent' };
  }

  if (await hasOAuthLoginOnly(user)) {
    const error = new Error('oauth_only_reset');
    error.status = 400;
    error.userId = user.id;
    error.email = user.email;
    throw error;
  }

  const rawToken = generateRawResetToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS);

  const [tokenRecord] = await PasswordResetToken.findOrCreate({
    where: { user_id: user.id },
    defaults: {
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  });

  if (!tokenRecord.isNewRecord) {
    await tokenRecord.update({
      token_hash: tokenHash,
      expires_at: expiresAt,
      used_at: null,
    });
  }

  // Generate reset URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

  // Send password reset email
  try {
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      userName: user.full_name || user.email,
      expiresInMinutes: Math.round(PASSWORD_RESET_EXPIRES_MS / 60000),
    });
  } catch (emailError) {
    // Log error but don't fail the request - token is still valid
    console.error('[AuthService] Failed to send reset email:', emailError.message);
  }

  return {
    requested: true,
    expiresAt,
  };
};

export const verifyResetToken = async ({ token }) => {
  if (!token || typeof token !== 'string') {
    const error = new Error('token is required');
    error.status = 400;
    throw error;
  }

  const tokenHash = hashToken(token);
  const resetRecord = await PasswordResetToken.findOne({
    where: { token_hash: tokenHash },
    include: [{ model: User, as: 'user', attributes: ['id', 'email', 'full_name'] }],
  });

  if (!resetRecord) {
    const error = new Error('invalid_or_expired_token');
    error.status = 400;
    throw error;
  }

  if (resetRecord.used_at) {
    const error = new Error('token_already_used');
    error.status = 400;
    throw error;
  }

  if (new Date(resetRecord.expires_at).getTime() < Date.now()) {
    const error = new Error('token_expired');
    error.status = 400;
    throw error;
  }

  return {
    valid: true,
    user: resetRecord.user,
    expiresAt: resetRecord.expires_at,
  };
};

export const resetPassword = async ({ token, password }) => {
  if (!token || typeof token !== 'string') {
    const error = new Error('token is required');
    error.status = 400;
    throw error;
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    const error = new Error('password must be at least 8 characters');
    error.status = 400;
    throw error;
  }

  const tokenHash = hashToken(token);
  const resetRecord = await PasswordResetToken.findOne({
    where: { token_hash: tokenHash },
    include: [{ model: User, as: 'user' }],
  });

  if (!resetRecord) {
    const error = new Error('invalid_or_expired_token');
    error.status = 400;
    throw error;
  }

  if (resetRecord.used_at) {
    const error = new Error('token_already_used');
    error.status = 400;
    throw error;
  }

  if (new Date(resetRecord.expires_at).getTime() < Date.now()) {
    const error = new Error('token_expired');
    error.status = 400;
    throw error;
  }

  const user = resetRecord.user;
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10);

  await user.update({ password_hash: passwordHash });
  await resetRecord.update({ used_at: new Date() });

  // Invalidate all user sessions (security)
  await UserSession.update(
    { is_active: false, last_activity: new Date() },
    { where: { user_id: user.id, is_active: true } }
  );

  // Send password changed notification email
  try {
    await sendPasswordChangedEmail({
      to: user.email,
      userName: user.full_name || user.email,
    });
  } catch (emailError) {
    console.error(
      '[AuthService] Failed to send password changed notification:',
      emailError.message
    );
  }

  return { success: true };
};
