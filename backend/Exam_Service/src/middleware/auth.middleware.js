/**
 * JWT Authentication Middleware for Exam Service
 * ESM - Verify JWT token và extract user info từ token
 * 
 * Token structure (từ user-service):
 * {
 *   id: UUID,
 *   email: string,
 *   role: "student" | "teacher" | "admin",
 *   role_id: number,
 *   token_type: "access",
 *   iat: number,
 *   exp: number
 * }
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

/**
 * Extract Bearer token from Authorization header
 */
const extractToken = (authHeader) => {
  if (!authHeader) return null;
  return authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;
};

/**
 * Verify JWT token và attach user info vào request
 */
export const authenticate = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify token type
    if (decoded.token_type !== "access") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      role_id: decoded.role_id,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "NotBeforeError") {
      return res.status(401).json({ error: "Token not active" });
    }
    return res.status(401).json({ error: "Authentication failed" });
  }
};

/**
 * Require specific roles
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

/**
 * Require student role - chỉ cho phép role = "student"
 */
export const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Student access required" });
  }

  next();
};

/**
 * Require teacher role
 */
export const requireTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Teacher access required" });
  }

  next();
};

/**
 * Require admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};
