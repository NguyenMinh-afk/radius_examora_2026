import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Shared modules
import { validateServiceEnv } from "../../shared/utils/env.validator.js";
import { requestIdMiddleware, correlationIdMiddleware } from "../../shared/middleware/requestId.js";
import { generalLimiter, authLimiter, forgotPasswordLimiter } from "../../shared/middleware/rateLimiter.js";
import { default as logger, log } from "../../shared/utils/logger.js";

dotenv.config();

// Validate environment variables (critical for auth service)
validateServiceEnv("userService");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Request ID & Correlation ID
app.use(requestIdMiddleware);
app.use(correlationIdMiddleware);

// Security headers (production only)
if (isProduction) {
  app.use(helmet());
  app.set("trust proxy", 1);
}

// Compression (production only)
if (isProduction) {
  app.use(compression());
}

// Disable x-powered-by header
app.disable("x-powered-by");

app.use(
  cors({
    origin: isProduction ? process.env.FRONTEND_URL || "http://localhost:5173" : "http://localhost:5173",
  })
);
app.use(express.json());
app.use(cookieParser());

// Rate limiting
app.use(generalLimiter);

// Routes
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Auth routes với rate limiting
app.use("/api/auth/login", authLimiter, authRoutes);
app.use("/api/auth/register", authLimiter, authRoutes);
app.use("/api/auth/forgot-password", forgotPasswordLimiter, authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Examora User_Service is running...");
});

// Enhanced Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "User_Service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", service: "User_Service" });
});

// Global error handler (SAU TẤT CẢ ROUTES)
app.use((err, req, res, next) => {
  log.error("Unhandled error", { error: err.message, stack: err.stack, requestId: req.requestId });
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    requestId: req.requestId,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  log.service.started(PORT);
});

export default app;
