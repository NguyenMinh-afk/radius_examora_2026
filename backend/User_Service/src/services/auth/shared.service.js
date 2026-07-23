import { randomUUID } from 'crypto';

import { generateTokens, getRefreshTokenExpiresAt } from '../../config/jwt.js';
import Role from '../../models/Role.js';
import User from '../../models/User.js';
import UserSession from '../../models/UserSession.js';

export const getRoleByName = async (name, options = {}) => {
  const role = await Role.findOne({ where: { name }, ...options });
  if (!role) {
    const error = new Error(`Role not found: ${name}`);
    error.status = 500;
    throw error;
  }
  return role;
};

export const getUserRole = async (user) => {
  if (!user?.role_id) return null;
  return Role.findByPk(user.role_id);
};

export const getApprovalStatusForRole = (roleName) =>
  roleName === 'teacher' ? 'pending' : 'approved';

export const toPublicUser = (user, role) => ({
  id: user.id,
  email: user.email,
  phone: user.phone,
  full_name: user.full_name,
  avatar_url: user.avatar_url,
  role: role?.name || null,
  role_id: user.role_id,
  is_active: user.is_active,
  email_verified: user.email_verified,
  approval_status: user.approval_status,
});

export const assertUserCanLogin = (user) => {
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error('Account is disabled');
    error.status = 403;
    throw error;
  }

  if (user.approval_status !== 'approved') {
    const error = new Error('Account is pending admin approval');
    error.status = 403;
    error.code = 'ACCOUNT_PENDING_APPROVAL';
    throw error;
  }
};

export const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }
  return token;
};

const createUserSession = async (req, user, refreshToken) =>
  UserSession.create({
    user_id: user.id,
    session_token: randomUUID(),
    refresh_token: refreshToken,
    device_type: 'web',
    ip_address: req.ip,
    user_agent: req.headers['user-agent'] || null,
    expires_at: getRefreshTokenExpiresAt(),
  });

export const issueAuthResponse = async (req, user) => {
  const role = await getUserRole(user);
  const tokens = generateTokens({
    id: user.id,
    email: user.email,
    role_id: user.role_id,
    role: role ? { name: role.name } : null,
  });

  await createUserSession(req, user, tokens.refreshToken);
  await user.update({ last_login: new Date() });

  return {
    ...tokens,
    token: tokens.accessToken,
    user: toPublicUser(user, role),
  };
};
