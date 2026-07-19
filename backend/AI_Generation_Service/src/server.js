import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

// Shared modules
import { validateServiceEnv } from "../../shared/utils/env.validator.js";
import { requestIdMiddleware, correlationIdMiddleware } from "../../shared/middleware/requestId.js";
import { generalLimiter, aiLimiter } from "../../shared/middleware/rateLimiter.js";
import { default as logger, log } from "../../shared/utils/logger.js";

dotenv.config();

// Validate environment variables
validateServiceEnv("aiService");

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

// CORS configuration
const corsOptions = isProduction
  ? {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

// Disable x-powered-by header
app.disable("x-powered-by");

// Rate limiting
app.use(generalLimiter);

// Routes - AI generation với rate limit riêng
import aiRoutes from "./routes/ai.routes.js";
app.use("/api/ai/generate", aiLimiter, aiRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.send("Examora AI_Generation_Service is running..."));

// Enhanced Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI_Generation_Service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", service: "AI_Generation_Service" });
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

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  log.service.started(PORT);
});

export default app;
