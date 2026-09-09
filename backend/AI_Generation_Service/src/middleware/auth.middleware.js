/**
 * JWT Middleware cho AI_Generation_Service
 *
 * BENCHMARK MODE:
 *   Khi BENCHMARK_MODE=true, bỏ qua JWT verify và trust các request từ
 *   benchmark tool. Điều kiện: process này KHÔNG được expose ra ngoài localhost
 *   khi benchmark đang chạy. Đây là escape hatch cho mock benchmark (line 8 .env
 *   đã có), KHÔNG dùng cho production.
 *
 *   NOTE: req.user.id phải là UUID của user thật trong DB vì AIGenerationRequest
 *   có FK user_id -> users(id). User 'teacher1@examora.local' luôn có sẵn từ
 *   seeder và PHẢI tồn tại trong user_db.users.
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
const BENCHMARK_MODE = process.env.BENCHMARK_MODE === "true";

// Seeded teacher account - luôn tồn tại sau khi chạy user_db seeder.
const BENCHMARK_USER_ID = "20000000-0000-0000-0000-000000000001";

export const authenticate = (req, res, next) => {
  if (BENCHMARK_MODE) {
    req.user = {
      id: BENCHMARK_USER_ID,
      email: "teacher1@examora.local",
      role: "teacher",
      role_id: 2,
    };
    return next();
  }

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
