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

// JSON parser
app.use(express.json({ limit: '10mb' }));

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
  const targetUrl = `${baseURL}${path}`;
  const timeout = 60_000; // 60 seconds

  log.info(`[PROXY] ${req.method} ${req.originalUrl} -> ${targetUrl}`);
  log.info(`[PROXY] Body type: ${typeof req.body}, has body: ${req.body != null}`);

  let timeoutId;
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Build clean headers
    const headers = {
      "content-type": "application/json",
      "accept": "application/json",
      "x-request-id": req.requestId,
      "x-correlation-id": req.correlationId,
    };
    
    // Copy relevant headers from original request
    if (req.headers["authorization"]) {
      headers["authorization"] = req.headers["authorization"];
    }
    
    const fetchOptions = {
      method: req.method,
      headers,
      signal: controller.signal,
    };
    
    if (req.method !== "GET") {
      const body = req.body;
      if (body && typeof body === 'object') {
        fetchOptions.body = JSON.stringify(body);
        log.info(`[PROXY] Sending body: ${fetchOptions.body.substring(0, 200)}`);
      } else if (body) {
        fetchOptions.body = String(body);
      } else {
        log.warn(`[PROXY] No body for POST request!`);
      }
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    
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
    const errorDetail = error.cause?.message || error.message;
    log.error(`[PROXY ERROR] ${serviceName}: ${errorDetail}`, { 
      error: errorDetail, 
      cause: error.cause,
      stack: error.stack,
      targetUrl
    });
    if (error.name === "AbortError" || error.message.includes("aborted")) {
      res.status(504).json({ error: "Gateway timeout", service: serviceName, detail: "Service took too long to respond" });
    } else if (error.cause?.code === "ECONNREFUSED" || error.message.includes("ECONNREFUSED")) {
      res.status(503).json({ error: "Service unavailable", service: serviceName });
    } else {
      res.status(502).json({ error: "Bad response from service", service: serviceName, detail: errorDetail });
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
// Proxy to AI_Generation_Service at /api/ai/* and /api/v1/ai/*
app.use("/api/ai", benchmarkLimiter, (req, res, _next) => proxyRequest(req, res, "ai", "/api/ai"));
app.use("/api/v1/ai", benchmarkLimiter, (req, res, _next) => proxyRequest(req, res, "ai", "/api/v1/ai"));

// Test endpoint on gateway
app.get("/gateway-test", (req, res) => res.json({ gateway: "ok" }));
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
