/**
 * Structured Logger
 * Thay thế console.log bằng logger có format chuẩn
 */
import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const serviceName = process.env.SERVICE_NAME || "examora-service";

const logger = pino({
  name: serviceName,
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: serviceName,
    pid: process.pid,
  },
  mixin() {
    return {
      timestamp: new Date().toISOString(),
    };
  },
});

export default logger;

// Helper methods
export const log = {
  info: (msg, obj = {}) => logger.info(obj, msg),
  error: (msg, obj = {}) => logger.error(obj, msg),
  warn: (msg, obj = {}) => logger.warn(obj, msg),
  debug: (msg, obj = {}) => logger.debug(obj, msg),

  // HTTP specific
  http: (req, res, durationMs) => {
    logger.info({
      msg: "HTTP Request",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: durationMs,
      requestId: req.requestId,
      correlationId: req.correlationId,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  },

  // Service specific
  service: {
    started: (port) => logger.info({ msg: "Service started", port }),
    shutdown: () => logger.info({ msg: "Service shutting down" }),
    dbConnected: () => logger.info({ msg: "Database connected" }),
    dbError: (err) => logger.error({ msg: "Database error", error: err.message }),
    rabbitmqConnected: () => logger.info({ msg: "RabbitMQ connected" }),
    rabbitmqError: (err) => logger.error({ msg: "RabbitMQ error", error: err.message }),
  },
};

export { logger };
