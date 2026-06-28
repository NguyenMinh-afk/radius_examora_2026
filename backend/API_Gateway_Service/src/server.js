/**
 * API_Gateway - Proxy/routing layer, không chứa business logic
 * Proxy requests đến các service:
 * - User_Service (auth, profile) - port 5000
 * - Exam_Service (student dashboard/classes/assignments/results) - port 3001
 * - Question_Service (questions) - port 3002
 * - AI_Generation_Service (ai) - port 3003
 * - Notification_Service (notifications) - port 3004
 * - Infrastructure_Service (health/workers) - port 5005
 */
import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Service URLs configuration
const SERVICES = {
  user: process.env.USER_SERVICE_URL || "http://localhost:5000",
  exam: process.env.EXAM_SERVICE_URL || "http://localhost:3001",
  question: process.env.QUESTION_SERVICE_URL || "http://localhost:3002",
  ai: process.env.AI_SERVICE_URL || "http://localhost:3003",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004",
  infra: process.env.INFRA_SERVICE_URL || "http://localhost:5005",
};

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Proxy helper - chuyển tiếp request đến service tương ứng
 */
async function proxyRequest(req, res, serviceName) {
  const baseURL = SERVICES[serviceName];
  if (!baseURL) {
    return res.status(500).json({ error: "Service not configured" });
  }

  const path = req.originalUrl.replace(/^\/api/, "");
  
  try {
    const response = await axios({
      method: req.method,
      url: `${baseURL}${path}`,
      data: req.body,
      params: req.query,
      headers: {
        ...req.headers,
        host: undefined,
        "x-forwarded-for": req.ip,
        "x-forwarded-proto": req.protocol,
      },
      timeout: 30000,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === "ECONNREFUSED") {
      res.status(503).json({ error: "Service unavailable", service: serviceName });
    } else {
      console.error(`[Proxy] ${serviceName} error:`, error.message);
      res.status(500).json({ error: "Gateway error", message: error.message });
    }
  }
}

/**
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "API_Gateway",
    timestamp: new Date().toISOString(),
  });
});

// User Service routes
app.use("/api/auth", (req, res, next) => proxyRequest(req, res, "user"));
app.use("/api/profile", (req, res, next) => proxyRequest(req, res, "user"));
app.use("/api/admin", (req, res, next) => proxyRequest(req, res, "user"));

// Exam Service routes
app.use("/api/student", (req, res, next) => proxyRequest(req, res, "exam"));
app.use("/api/teacher", (req, res, next) => proxyRequest(req, res, "exam"));

// Question Service routes
app.use("/api/questions", (req, res, next) => proxyRequest(req, res, "question"));
app.use("/api/collections", (req, res, next) => proxyRequest(req, res, "question"));

// AI Service routes
app.use("/api/ai", (req, res, next) => proxyRequest(req, res, "ai"));

// Notification Service routes
app.use("/api/notifications", (req, res, next) => proxyRequest(req, res, "notification"));

// Infrastructure Service routes (health check only)
app.get("/api/infra/health", (req, res, next) => proxyRequest(req, res, "infra"));

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    name: "Examora API Gateway",
    version: "1.0.0",
    services: Object.keys(SERVICES),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[API_Gateway] running on port ${PORT}`);
  console.log(`[API_Gateway] Proxy routes:`);
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`  /api/* -> ${name}: ${url}`);
  });
});

export default app;
