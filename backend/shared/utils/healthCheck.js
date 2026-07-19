/**
 * Enhanced Health Check
 * Bao gồm: liveness, readiness, dependencies status
 */
import db from "../models/index.js";
import { getRabbitMQStatus } from "./rabbitmq.js";

/**
 * Liveness Probe - Container còn sống không?
 * Kubernetes dùng endpoint này để quyết định restart
 */
export async function livenessCheck() {
  return {
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
}

/**
 * Readiness Probe - Service sẵn sàng nhận traffic?
 * Kubernetes dùng endpoint này để quyết định route traffic
 */
export async function readinessCheck() {
  const checks = {
    database: { status: "UNKNOWN" },
    rabbitmq: { status: "UNKNOWN" },
  };

  // Check database
  try {
    await db.sequelize.query("SELECT 1");
    checks.database = { status: "UP" };
  } catch (error) {
    checks.database = { status: "DOWN", error: error.message };
  }

  // Check RabbitMQ
  try {
    const rabbitmqStatus = getRabbitMQStatus();
    checks.rabbitmq = rabbitmqStatus;
  } catch (error) {
    checks.rabbitmq = { status: "DOWN", error: error.message };
  }

  // Tổng hợp status
  const allUp = Object.values(checks).every((c) => c.status === "UP");
  const overallStatus = allUp ? "UP" : "DEGRADED";

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
  };
}

/**
 * Full health check (kết hợp)
 */
export async function fullHealthCheck() {
  const liveness = await livenessCheck();
  const readiness = await readinessCheck();

  return {
    status: readiness.status,
    liveness,
    readiness,
    version: process.env.VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  };
}
