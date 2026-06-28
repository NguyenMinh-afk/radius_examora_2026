/**
 * Infrastructure_Service
 * CHỦ YẾU chứa hạ tầng: queue consumers, email workers, cleanup jobs, storage, logging
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectRabbitMQ, setupExchangesAndQueues, closeRabbitMQ } from "./config/rabbitmq.js";
import { startEmailConsumer } from "./workers/email.consumer.js";
import { startNotificationConsumer } from "./workers/notification.consumer.js";
import { startAIConsumer } from "./workers/ai.consumer.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;
let rabbitMQConnected = false;
let consumersStarted = false;

// Middleware
app.use(cors());
app.use(express.json());

// Health check - include RabbitMQ status
app.get("/", (req, res) => res.send("Examora Infrastructure_Service is running..."));
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Infrastructure_Service",
    rabbitmq: rabbitMQConnected ? "connected" : "disconnected",
    consumers: consumersStarted ? "running" : "stopped",
  });
});

/**
 * Thử kết nối RabbitMQ với retry
 */
async function connectWithRetry(maxRetries = 5, intervalMs = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Infrastructure] Attempting to connect to RabbitMQ (${i + 1}/${maxRetries})...`);
      await connectRabbitMQ();
      await setupExchangesAndQueues();
      console.log("[Infrastructure] RabbitMQ connected successfully!");
      return true;
    } catch (error) {
      console.error(`[Infrastructure] RabbitMQ connection failed: ${error.message}`);
      if (i < maxRetries - 1) {
        console.log(`[Infrastructure] Retrying in ${intervalMs / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
  }
  return false;
}

/**
 * Khởi động Infrastructure Service
 */
async function startInfrastructure() {
  console.log("[Infrastructure] Starting Infrastructure Service...");
  
  // Start HTTP server trước (để health check hoạt động)
  app.listen(PORT, () => {
    console.log(`[Infrastructure] HTTP server running on port ${PORT}`);
  });
  
  // Thử kết nối RabbitMQ (với retry)
  const connected = await connectWithRetry();
  rabbitMQConnected = connected;
  
  if (connected) {
    try {
      console.log("[Infrastructure] Starting queue consumers...");
      await Promise.all([
        startEmailConsumer(),
        startNotificationConsumer(),
        startAIConsumer(),
      ]);
      consumersStarted = true;
      console.log("[Infrastructure] All consumers started successfully!");
    } catch (error) {
      console.error("[Infrastructure] Failed to start consumers:", error.message);
    }
  } else {
    console.warn("[Infrastructure] WARNING: Running WITHOUT RabbitMQ connection");
    console.warn("[Infrastructure] Workers are disabled. Start RabbitMQ to enable workers.");
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[Infrastructure] Shutting down gracefully...");
  await closeRabbitMQ();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[Infrastructure] Shutting down gracefully...");
  await closeRabbitMQ();
  process.exit(0);
});

// Chạy service
startInfrastructure();

export default app;
