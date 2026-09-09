import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import http from "node:http";

// Shared modules
import { validateServiceEnv } from "../../shared/utils/env.validator.js";
import { requestIdMiddleware, correlationIdMiddleware } from "../../shared/middleware/requestId.js";
import { generalLimiter } from "../../shared/middleware/rateLimiter.js";
import { default as logger, log } from "../../shared/utils/logger.js";

// WebSocket Manager
import wsManager from "./websocket/manager.js";

dotenv.config();

// Validate environment variables
validateServiceEnv("notificationService");

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

const corsOptions = isProduction
  ? { origin: process.env.FRONTEND_URL || "http://localhost:5173" }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
app.use(generalLimiter);

// Routes
import notificationRoutes from "./routes/notification.routes.js";
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Examora Notification_Service is running...");
});

// Enhanced Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Notification_Service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", service: "Notification_Service" });
});

// WebSocket health check
app.get("/health/ws", (req, res) => {
  const wsStats = wsManager.getStats();
  res.json({
    websocket: {
      enabled: true,
      path: "/ws/notifications",
      ...wsStats,
    },
  });
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

const PORT = process.env.PORT || 3004;

// Create HTTP server (for WebSocket support)
const server = http.createServer(app);

// Initialize WebSocket server
wsManager.initialize(server);
wsManager.startHeartbeat();

server.listen(PORT, () => {
  log.service.started(PORT);
  console.log(`[Notification_Service] WebSocket available at ws://localhost:${PORT}/ws/notifications`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n[Notification_Service] Received ${signal}. Shutting down gracefully...`);
  wsManager.close();
  server.close(() => {
    console.log("[Notification_Service] HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default app;
export { server };
