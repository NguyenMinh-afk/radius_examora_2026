/**
 * Rate Limiter Middleware
 * Bảo vệ against brute force attacks
 */
import rateLimit from "express-rate-limit";

/**
 * Rate limit chung cho tất cả routes
 * 100 requests / 15 phút
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests",
    retryAfter: "Please try again in 15 minutes",
  },
});

/**
 * Rate limit cho auth routes (/login, /register)
 * 10 requests / 15 phút - chống brute force
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts",
    retryAfter: "Please try again in 15 minutes",
  },
  skipSuccessfulRequests: false,
});

/**
 * Rate limit cho /forgot-password
 * 3 requests / 15 phút - security cao
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many password reset attempts",
    retryAfter: "Please try again in 15 minutes",
  },
  keyGenerator: (req) => {
    // Theo IP hoặc email
    return req.body?.email || req.ip;
  },
});

/**
 * Rate limit cho API calls nặng (AI generation)
 * 20 requests / 5 phút
 */
export const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI generation requests",
    retryAfter: "Please try again in 5 minutes",
  },
});

/**
 * Rate limit cho search/query
 * 30 requests / 1 phút
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many search requests",
    retryAfter: "Please try again in 1 minute",
  },
});

/**
 * Skip rate limit nếu là health check
 */
export const skipHealthCheck = (req) => {
  return req.path === "/health" || req.path === "/ready" || req.path === "/";
};
