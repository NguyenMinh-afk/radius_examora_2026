/**
 * JWT Authentication Middleware cho Notification_Service
 * ESM - Verify JWT token từ User_Service
 * 
 * Token payload (từ User_Service):
 * { id, email, role: { name }, role_id, token_type: "access" }
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.token_type !== "access") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role?.name || decoded.role,
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
    return res.status(401).json({ error: "Authentication failed" });
  }
};
