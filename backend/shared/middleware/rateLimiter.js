/**
 * Rate Limiter Middleware
 * Bảo vệ against brute force attacks
 */
import rateLimit from "express-rate-limit";

const isBenchmarkMode = process.env.BENCHMARK_MODE === "true";

/**
 * Rate limit chung cho tất cả routes
 * - Production: 5000 requests / 15 phút
 * - Benchmark mode: bypass hoàn toàn
 */
export const generalLimiter = isBenchmarkMode
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5000,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "Too many requests",
        retryAfter: "Please try again in 15 minutes",
      },
    });

/**
 * Rate limit cho benchmark/testing
 * - Production: 10000 requests / 15 phút
 * - Benchmark mode: bypass hoàn toàn
 */
export const benchmarkLimiter = isBenchmarkMode
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10000,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "Too many requests for benchmark",
        retryAfter: "Please try again in 15 minutes",
      },
    });

/**
 * Rate limit cho auth routes (/login, /register)
 * 10 requests / 15 phút - chống brute force
 * ⚠️ KHÔNG bypass kể cả benchmark mode (bảo mật)
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
 * ⚠️ KHÔNG bypass kể cả benchmark mode (bảo mật)
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
    return req.body?.email || req.ip;
  },
});

/**
 * Rate limit cho API calls nặng (AI generation)
 * - Production: 1000 requests / 5 phút
 * - Benchmark mode: bypass hoàn toàn
 */
export const aiLimiter = isBenchmarkMode
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 1000,
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
 * - Benchmark mode: bypass
 */
export const searchLimiter = isBenchmarkMode
  ? (req, res, next) => next()
  : rateLimit({
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
