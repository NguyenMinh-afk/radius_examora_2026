import bcrypt from "bcrypt";
import { Op } from "sequelize";

import {
  generateTokens,
  getRefreshTokenExpiresAt,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../config/jwt.js";
import User from "../../models/User.js";
import UserSession from "../../models/UserSession.js";
import {
  getRoleByName,
  getApprovalStatusForRole,
  assertUserCanLogin,
  getBearerToken,
} from "./shared.service.js";

export { getBearerToken };

export const register = async (body) => {
  const {
    email,
    password,
    phone,
    full_name,
    fullName,
    role,
    userType,
  } = body;

  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedRole = (role || userType || "student").toLowerCase();
  const name = full_name || fullName;

  if (!normalizedEmail || !password || !name) {
    const error = new Error("email, password and full_name are required");
    error.status = 400;
    throw error;
  }

  if (!["student", "teacher"].includes(normalizedRole)) {
    const error = new Error("role must be student or teacher");
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { email: normalizedEmail },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });

  if (existingUser) {
    const error = new Error("Email or phone already exists");
    error.status = 409;
    throw error;
  }

  const userRole = await getRoleByName(normalizedRole);
  const approvalStatus = getApprovalStatusForRole(userRole.name);
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10);

  const user = await User.create({
    email: normalizedEmail,
    phone: phone || null,
    password_hash: passwordHash,
    full_name: name,
    role_id: userRole.id,
    is_active: true,
    email_verified: false,
    approval_status: approvalStatus,
    approved_at: approvalStatus === "approved" ? new Date() : null,
  });

  return {
    user,
    userRole,
    approvalStatus,
  };
};

export const login = async (body) => {
  const { email, phone, identifier, password } = body;
  const rawLoginId = email || phone || identifier;
  const loginId = rawLoginId?.trim().toLowerCase();

  if (!loginId || !password) {
    const error = new Error("email or phone and password are required");
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
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  return { user };
};

export const refreshTokens = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("refreshToken is required");
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
    const error = new Error("Invalid refresh token");
    error.status = 401;
    throw error;
  }

  const user = await User.findByPk(decoded.id);
  assertUserCanLogin(user);

  const { getUserRole } = await import("./shared.service.js");
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
    const error = new Error("Missing bearer token");
    error.status = 401;
    throw error;
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findByPk(decoded.id);
  assertUserCanLogin(user);

  const { getUserRole, toPublicUser } = await import("./shared.service.js");
  const role = await getUserRole(user);

  return {
    user: toPublicUser(user, role),
  };
};
