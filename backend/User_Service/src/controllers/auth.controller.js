import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { OAuth2Client } from "google-auth-library";
import { Op } from "sequelize";

import { setOAuthResult, getOAuthResult, deleteOAuthResult } from "../services/oauthTempStore.js";
import {
  generateTokens,
  getRefreshTokenExpiresAt,
  verifyAccessToken,
  verifyRefreshToken,
} from "../config/jwt.js";
import OAuthProvider from "../models/user/OAuthProvider.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import UserSession from "../models/UserSession.js";

const GOOGLE_PROVIDER = "google";
const DEFAULT_FRONTEND_URL = "http://localhost:5173";

const getFrontendUrl = () => process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

const validateGoogleConfig = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
};

const getGoogleClient = () =>
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

const getRoleByName = async (name) => {
  const role = await Role.findOne({ where: { name } });
  if (!role) {
    const error = new Error(`Role not found: ${name}`);
    error.status = 500;
    throw error;
  }
  return role;
};

const getUserRole = async (user) => {
  if (!user?.role_id) return null;
  return Role.findByPk(user.role_id);
};

const getApprovalStatusForRole = (roleName) =>
  roleName === "teacher" ? "pending" : "approved";

const toPublicUser = (user, role) => ({
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

const assertUserCanLogin = (user) => {
  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error("Account is disabled");
    error.status = 403;
    throw error;
  }

  if (user.approval_status !== "approved") {
    const error = new Error("Account is pending admin approval");
    error.status = 403;
    error.code = "ACCOUNT_PENDING_APPROVAL";
    throw error;
  }
};

const createUserSession = async (req, user, refreshToken) =>
  UserSession.create({
    user_id: user.id,
    session_token: randomUUID(),
    refresh_token: refreshToken,
    device_type: "web",
    ip_address: req.ip,
    user_agent: req.headers["user-agent"] || null,
    expires_at: getRefreshTokenExpiresAt(),
  });

const issueAuthResponse = async (req, user) => {
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

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
};

const redirectToFrontend = (res, path, searchParams = {}, hashParams = {}) => {
  const url = new URL(path, getFrontendUrl());

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const hash = new URLSearchParams();
  for (const [key, value] of Object.entries(hashParams)) {
    if (value !== undefined && value !== null) {
      hash.set(key, String(value));
    }
  }

  if ([...hash.keys()].length > 0) {
    url.hash = hash.toString();
  }

  return res.redirect(url.toString());
};

const getGoogleUserFromCode = async (code, redirectUri) => {
  const client = getGoogleClient();
  const { tokens } = await client.getToken(
    redirectUri ? { code, redirect_uri: redirectUri } : code
  );

  if (!tokens.id_token) {
    const error = new Error("Google did not return an id_token");
    error.status = 401;
    throw error;
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload?.sub) {
    const error = new Error("Google account payload is missing email or subject");
    error.status = 401;
    throw error;
  }

  if (payload.email_verified === false) {
    const error = new Error("Google email is not verified");
    error.status = 403;
    throw error;
  }

  return {
    providerUserId: payload.sub,
    email: payload.email,
    fullName: payload.name || payload.email,
    avatarUrl: payload.picture || null,
    accessToken: tokens.access_token || null,
    refreshToken: tokens.refresh_token || null,
    tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
  };
};

const getGoogleUserFromCredential = async (credential) => {
  const client = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload?.sub) {
    const error = new Error("Google account payload is missing email or subject");
    error.status = 401;
    throw error;
  }

  if (payload.email_verified === false) {
    const error = new Error("Google email is not verified");
    error.status = 403;
    throw error;
  }

  return {
    providerUserId: payload.sub,
    email: payload.email,
    fullName: payload.name || payload.email,
    avatarUrl: payload.picture || null,
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
  };
};

const findOrCreateGoogleUser = async (googleUser) => {
  let provider = await OAuthProvider.findOne({
    where: {
      provider: GOOGLE_PROVIDER,
      provider_user_id: googleUser.providerUserId,
    },
  });

  if (provider) {
    const existingUser = await User.findByPk(provider.user_id);
    if (!existingUser) {
      const error = new Error("Linked Google account has no user");
      error.status = 500;
      throw error;
    }

    await provider.update({
      access_token: googleUser.accessToken,
      refresh_token: googleUser.refreshToken || provider.refresh_token,
      token_expires_at: googleUser.tokenExpiresAt,
    });

    return existingUser;
  }

  let user = await User.findOne({ where: { email: googleUser.email } });

  if (!user) {
    const studentRole = await getRoleByName("student");

    user = await User.create({
      email: googleUser.email,
      password_hash: await bcrypt.hash(randomUUID(), 10),
      full_name: googleUser.fullName,
      avatar_url: googleUser.avatarUrl,
      role_id: studentRole.id,
      is_active: true,
      email_verified: true,
      approval_status: "approved",
      approved_at: new Date(),
    });
  }

  provider = await OAuthProvider.create({
    user_id: user.id,
    provider: GOOGLE_PROVIDER,
    provider_user_id: googleUser.providerUserId,
    access_token: googleUser.accessToken,
    refresh_token: googleUser.refreshToken,
    token_expires_at: googleUser.tokenExpiresAt,
  });

  return user;
};

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      phone,
      full_name,
      fullName,
      role,
      userType,
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedRole = (role || userType || "student").toLowerCase();
    const name = full_name || fullName;

    if (!normalizedEmail || !password || !name) {
      return res.status(400).json({
        message: "email, password and full_name are required",
      });
    }

    if (!["student", "teacher"].includes(normalizedRole)) {
      return res.status(400).json({
        message: "role must be student or teacher",
      });
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
      return res.status(409).json({
        message: "Email or phone already exists",
      });
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

    if (approvalStatus !== "approved") {
      return res.status(201).json({
        message: "Account registered and pending admin approval",
        user: toPublicUser(user, userRole),
      });
    }

    const authResponse = await issueAuthResponse(req, user);

    return res.status(201).json({
      message: "User registered successfully",
      ...authResponse,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: "Registration failed",
      error: err.message,
      code: err.code,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const rawLoginId = email || phone || identifier;
    const loginId = rawLoginId?.trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({
        message: "email or phone and password are required",
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: loginId }, { phone: loginId }],
      },
    });

    assertUserCanLogin(user);

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const authResponse = await issueAuthResponse(req, user);

    return res.json({
      message: "Login successful",
      ...authResponse,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: "Login failed",
      error: err.message,
      code: err.code,
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
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
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findByPk(decoded.id);
    assertUserCanLogin(user);

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

    return res.json({
      message: "Token refreshed",
      ...tokens,
      token: tokens.accessToken,
      user: toPublicUser(user, role),
    });
  } catch (err) {
    return res.status(err.status || 401).json({
      message: "Refresh token failed",
      error: err.message,
      code: err.code,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await UserSession.update(
        { is_active: false, last_activity: new Date() },
        { where: { refresh_token: refreshToken } }
      );
    }

    return res.json({ message: "Logged out" });
  } catch (err) {
    return res.status(500).json({
      message: "Logout failed",
      error: err.message,
    });
  }
};

export const me = async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: "Missing bearer token" });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findByPk(decoded.id);
    assertUserCanLogin(user);

    const role = await getUserRole(user);

    return res.json({
      user: toPublicUser(user, role),
    });
  } catch (err) {
    return res.status(err.status || 401).json({
      message: "Authentication failed",
      error: err.message,
      code: err.code,
    });
  }
};

export const googleLogin = (req, res) => {
  try {
    if (!validateGoogleConfig() || !process.env.GOOGLE_CALLBACK_URL) {
      return res.status(500).json({
        message: "Missing Google OAuth configuration",
      });
    }

    const client = getGoogleClient();
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      prompt: "select_account",
      scope: ["openid", "email", "profile"],
    });

    return res.redirect(authUrl);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to start Google login",
      error: err.message,
    });
  }
};

export const googleLoginCredential = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    if (!validateGoogleConfig()) {
      return res.status(500).json({
        message: "Missing Google OAuth configuration",
      });
    }

    const googleUser = await getGoogleUserFromCredential(credential);
    const user = await findOrCreateGoogleUser(googleUser);
    assertUserCanLogin(user);

    const authResponse = await issueAuthResponse(req, user);
    return res.json({
      message: "Google login successful",
      ...authResponse,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: "Google login failed",
      error: err.message,
    });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const googleError = typeof req.query.error === "string" ? req.query.error : null;
    const googleErrorDescription =
      typeof req.query.error_description === "string"
        ? req.query.error_description
        : null;

    if (googleError) {
      return res.redirect(
        `${getFrontendUrl()}/oauth/google/callback?error=${encodeURIComponent(googleError)}&message=${encodeURIComponent(googleErrorDescription || googleError)}`
      );
    }

    if (!code) {
      return res.redirect(
        `${getFrontendUrl()}/oauth/google/callback?error=missing_code&message=Google+did+not+return+an+authorization+code`
      );
    }

    if (!validateGoogleConfig()) {
      return res.redirect(
        `${getFrontendUrl()}/oauth/google/callback?error=missing_google_config&message=Missing+Google+OAuth+configuration`
      );
    }

    const redirectUri = typeof req.query.redirectUri === "string"
      ? req.query.redirectUri
      : process.env.GOOGLE_CALLBACK_URL;

    if (!redirectUri) {
      return res.redirect(
        `${getFrontendUrl()}/oauth/google/callback?error=missing_redirect_uri&message=Missing+Google+OAuth+redirect+URI`
      );
    }

    const googleUser = await getGoogleUserFromCode(code, redirectUri);
    const user = await findOrCreateGoogleUser(googleUser);

    try {
      assertUserCanLogin(user);
    } catch (err) {
      if (err.code === "ACCOUNT_PENDING_APPROVAL") {
        return res.redirect(
          `${getFrontendUrl()}/oauth/google/callback?error=pending_approval&message=Account+is+pending+admin+approval`
        );
      }
      throw err;
    }

    const authResponse = await issueAuthResponse(req, user);

    const oauthStateId = randomUUID();
    setOAuthResult(oauthStateId, {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: authResponse.user,
    });

    return res.redirect(
      `${getFrontendUrl()}/oauth/google/callback?state=${encodeURIComponent(oauthStateId)}`
    );
  } catch (err) {
    return res.redirect(
      `${getFrontendUrl()}/oauth/google/callback?error=callback_error&message=${encodeURIComponent(err.message)}`
    );
  }
};

export const googleResult = async (req, res) => {
  try {
    const { state } = req.query;

    if (!state || typeof state !== "string") {
      return res.status(400).json({
        success: false,
        message: "Missing OAuth state",
      });
    }

    const authResult = getOAuthResult(state);

    if (!authResult) {
      return res.status(404).json({
        success: false,
        message: "OAuth result expired or not found. Please try logging in again.",
      });
    }

    deleteOAuthResult(state);

    return res.json({
      success: true,
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      user: authResult.user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get Google OAuth result",
    });
  }
};
