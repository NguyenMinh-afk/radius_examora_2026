/**
 * Infrastructure_Service
 * CHỦ YẾU chứa hạ tầng: queue consumers, email workers, cleanup jobs
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

// Shared modules
import { validateServiceEnv } from "../../shared/utils/env.validator.js";
import { requestIdMiddleware, correlationIdMiddleware } from "../../shared/middleware/requestId.js";
import { generalLimiter } from "../../shared/middleware/rateLimiter.js";
import { default as logger, log } from "../../shared/utils/logger.js";

dotenv.config();

// Validate environment variables
validateServiceEnv("infrastructureService");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 5005;
let rabbitMQConnected = false;
let consumersStarted = false;
let server = null;

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

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
app.use(generalLimiter);

// Health check endpoints
app.get("/", (req, res) => res.send("Examora Infrastructure_Service is running..."));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Infrastructure_Service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    rabbitmq: rabbitMQConnected ? "connected" : "disconnected",
    consumers: consumersStarted ? "running" : "stopped",
  });
});

app.get("/ready", (req, res) => {
  res.json({
    status: consumersStarted ? "ready" : "not_ready",
    service: "Infrastructure_Service",
    rabbitmq: rabbitMQConnected,
    consumers: consumersStarted,
  });
});

// Liveness probe
app.get("/live", (req, res) => {
  res.json({ status: "alive", timestamp: new Date().toISOString() });
});

// Import RabbitMQ utilities từ shared
import { connectRabbitMQ, setupExchangesAndQueues, closeRabbitMQ } from "./config/rabbitmq.js";
import { startInfrastructureConsumers } from "./workers/registry.js";

/**
 * Connect RabbitMQ với retry
 */
async function connectWithRetry(maxRetries = 5, intervalMs = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      log.info(`Connecting to RabbitMQ (${i + 1}/${maxRetries})...`);
      await connectRabbitMQ(process.env.RABBITMQ_URL);
      await setupExchangesAndQueues();
      log.service.rabbitmqConnected();
      return true;
    } catch (error) {
      log.error("RabbitMQ connection failed", { error: error.message });
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  }
  return false;
}

/**
 * Start Infrastructure Service
 */
async function startInfrastructure() {
  log.info("Starting Infrastructure Service...");

  // Start HTTP server
  server = app.listen(PORT, () => {
    log.service.started(PORT);
  });

  // Connect RabbitMQ
  const connected = await connectWithRetry();
  rabbitMQConnected = connected;

  if (connected) {
    try {
      log.info("Starting queue consumers...");
      await startInfrastructureConsumers();
      consumersStarted = true;
      log.info("All consumers started successfully!");
    } catch (error) {
      log.error("Failed to start consumers", { error: error.message });
    }
  } else {
    log.warn("Running WITHOUT RabbitMQ connection - Workers disabled");
  }
}

/**
 * Graceful Shutdown
 */
async function gracefulShutdown(signal) {
  log.info(`Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      log.info("HTTP server closed");
    });
  }

  try {
    // Close RabbitMQ
    await closeRabbitMQ();
    log.info("RabbitMQ connection closed");

    // Close consumers
    // (thêm logic close consumers nếu cần)

    log.service.shutdown();
    process.exit(0);
  } catch (error) {
    log.error("Error during shutdown", { error: error.message });
    process.exit(1);
  }
}

// Signal handlers
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Uncaught exception handler
process.on("uncaughtException", (err) => {
  log.error("Uncaught Exception", { error: err.message, stack: err.stack });
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  log.error("Unhandled Rejection", { reason: String(reason) });
});

// Start
startInfrastructure();

export default app;
