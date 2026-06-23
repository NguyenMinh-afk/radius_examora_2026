/**
 * JWT Middleware cho AI_Generation_Service
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if (!token) return res.status(401).json({ error: "No token provided" });

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
    return res.status(401).json({ error: "Authentication failed" });
  }
};
