import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

// Shared modules
import { validateServiceEnv } from "../../shared/utils/env.validator.js";
import { requestIdMiddleware, correlationIdMiddleware } from "../../shared/middleware/requestId.js";
import { generalLimiter, searchLimiter } from "../../shared/middleware/rateLimiter.js";
import { default as logger, log } from "../../shared/utils/logger.js";

dotenv.config();

// Validate environment variables
validateServiceEnv("examService");

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
    credentials: true,
  })
);
app.use(express.json());
app.disable("etag");

// Rate limiting
app.use(generalLimiter);

// Routes
import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);

app.get("/", (req, res) => {
  res.send("Examora Exam_Service is running...");
});

// Enhanced Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Exam_Service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", service: "Exam_Service" });
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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  log.service.started(PORT);
});

export default app;
