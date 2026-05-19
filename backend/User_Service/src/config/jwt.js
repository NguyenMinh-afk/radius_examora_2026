import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_ACCESS_TOKEN_TTL = "2h";
const DEFAULT_REFRESH_TOKEN_TTL = "7d";

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getAccessTokenSecret = () => getRequiredEnv("JWT_SECRET");
const getRefreshTokenSecret = () => getRequiredEnv("JWT_REFRESH_SECRET");

export const getAccessTokenExpiresIn = () =>
  process.env.JWT_EXPIRES_IN || DEFAULT_ACCESS_TOKEN_TTL;

export const getRefreshTokenExpiresIn = () =>
  process.env.JWT_REFRESH_EXPIRES_IN || DEFAULT_REFRESH_TOKEN_TTL;

export const buildTokenPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role?.name || user.role_name || user.role || null,
  role_id: user.role_id,
});

export const generateAccessToken = (payload) =>
  jwt.sign(
    {
      ...payload,
      token_type: "access",
    },
    getAccessTokenSecret(),
    {
      expiresIn: getAccessTokenExpiresIn(),
    }
  );

export const generateRefreshToken = (payload) =>
  jwt.sign(
    {
      ...payload,
      token_type: "refresh",
    },
    getRefreshTokenSecret(),
    {
      expiresIn: getRefreshTokenExpiresIn(),
    }
  );

export const generateTokens = (user) => {
  const payload = buildTokenPayload(user);

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: getAccessTokenExpiresIn(),
    refreshExpiresIn: getRefreshTokenExpiresIn(),
  };
};

export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, getAccessTokenSecret());
  if (decoded.token_type !== "access") {
    throw new Error("Invalid access token type");
  }
  return decoded;
};

export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, getRefreshTokenSecret());
  if (decoded.token_type !== "refresh") {
    throw new Error("Invalid refresh token type");
  }
  return decoded;
};

export const parseDurationToMs = (duration) => {
  if (typeof duration === "number") {
    return duration * 1000;
  }

  const normalized = String(duration).trim().toLowerCase();
  const match = normalized.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`Unsupported token duration: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
};

export const getRefreshTokenExpiresAt = (fromDate = new Date()) =>
  new Date(fromDate.getTime() + parseDurationToMs(getRefreshTokenExpiresIn()));
