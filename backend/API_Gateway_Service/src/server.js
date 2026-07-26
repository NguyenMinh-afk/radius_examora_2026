import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

// Shared modules
import { validateServiceEnv } from "../../shared/utils/env.validator.js";
import { requestIdMiddleware, correlationIdMiddleware } from "../../shared/middleware/requestId.js";
import { generalLimiter, authLimiter, benchmarkLimiter } from "../../shared/middleware/rateLimiter.js";
import { default as logger, log } from "../../shared/utils/logger.js";

dotenv.config();

// Validate environment variables
validateServiceEnv("apiGateway");

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

// CORS
app.use(cors());
app.use(express.json());

// Rate limiting (global)
app.use(generalLimiter);

// Service URLs
const SERVICES = {
  user: process.env.USER_SERVICE_URL || "http://localhost:5000",
  exam: process.env.EXAM_SERVICE_URL || "http://localhost:3001",
  question: process.env.QUESTION_SERVICE_URL || "http://localhost:3002",
  ai: process.env.AI_SERVICE_URL || "http://localhost:3003",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004",
  infra: process.env.INFRA_SERVICE_URL || "http://localhost:5005",
};

// Proxy helper
async function proxyRequest(req, res, serviceName, serviceBasePath) {
  const baseURL = SERVICES[serviceName];
  if (!baseURL) {
    return res.status(500).json({ error: "Service not configured" });
  }

  // Strip gateway prefix, replace with service prefix
  const path = req.originalUrl.replace(/^\/api\/[^/]+/, serviceBasePath);
  const timeout = 60_000; // 60 seconds

  let timeoutId;
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${baseURL}${path}`, {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined,
        "x-request-id": req.requestId,
        "x-correlation-id": req.correlationId,
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    timeoutId = undefined;

    const duration = Date.now() - startTime;
    log.http(req, { status: response.status, duration }, { service: serviceName });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    try {
      if (isJson) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        if (response.ok) {
          res.status(response.status).send(text || response.statusText);
        } else {
          res.status(response.status).type("text/plain").send(text || response.statusText);
        }
      }
    } catch (bodyError) {
      log.warn("Failed to parse response body, sending raw status", { error: bodyError.message });
      res.status(response.status).end();
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    log.error(`Proxy ${serviceName} error`, { error: error.message });
    if (error.name === "AbortError" || error.message.includes("aborted")) {
      res.status(504).json({ error: "Gateway timeout", service: serviceName, detail: "Service took too long to respond" });
    } else if (error.cause?.code === "ECONNREFUSED" || error.message.includes("ECONNREFUSED")) {
      res.status(503).json({ error: "Service unavailable", service: serviceName });
    } else {
      res.status(502).json({ error: "Bad response from service", service: serviceName, detail: error.message });
    }
  }
}

// Health check endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "API_Gateway",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", service: "API_Gateway" });
});

// Routes với rate limiting cho auth
app.use("/api/auth", authLimiter, (req, res, _next) => proxyRequest(req, res, "user", "/api/auth"));
app.use("/api/profile", (req, res, _next) => proxyRequest(req, res, "user", "/api/profile"));
app.use("/api/admin", (req, res, _next) => proxyRequest(req, res, "user", "/api/admin"));
app.use("/api/student", (req, res, _next) => proxyRequest(req, res, "exam", "/api/student"));
app.use("/api/teacher", (req, res, _next) => proxyRequest(req, res, "exam", "/api/teacher"));
app.use("/api/questions", (req, res, _next) => proxyRequest(req, res, "question", "/api/questions"));
app.use("/api/collections", (req, res, _next) => proxyRequest(req, res, "question", "/api/collections"));

// AI routes - use benchmarkLimiter for high-volume requests
app.use("/api/ai", benchmarkLimiter, (req, res, _next) => proxyRequest(req, res, "ai", "/api/v1/ai"));
app.use("/api/notifications", (req, res, _next) => proxyRequest(req, res, "notification", "/api/notifications"));
app.get("/api/infra/health", (req, res, _next) => proxyRequest(req, res, "infra", "/api/infra"));

// Root
app.get("/", (req, res) => {
  res.json({
    name: "Examora API Gateway",
    version: "1.0.0",
    services: Object.keys(SERVICES),
  });
});

// Global error handler (ĐẶT SAU TẤT CẢ ROUTES)
app.use((err, req, res, _next) => {
  log.error("Unhandled error", { error: err.message, stack: err.stack, requestId: req.requestId });
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    requestId: req.requestId,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl, requestId: req.requestId });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log.service.started(PORT);
  logger.info({ msg: "Proxy routes:", services: SERVICES });
});

export default app;
