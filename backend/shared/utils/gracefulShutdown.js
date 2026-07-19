/**
 * Graceful Shutdown Handler
 * Xử lý tắt service an toàn
 */
import logger from "./logger.js";

let isShuttingDown = false;
let connections = [];

export function setIsShuttingDown(value) {
  isShuttingDown = value;
}

export function registerConnection(connection) {
  connections.push(connection);
}

export function setupGracefulShutdown(server, options = {}) {
  const {
    db,
    rabbitmq,
    redis,
    timeout = 30000, // 30 giây timeout
  } = options;

  const shutdown = async (signal) => {
    if (isShuttingDown) {
      logger.warn("Shutdown already in progress");
      return;
    }

    isShuttingDown = true;
    logger.info({ msg: `Received ${signal}. Starting graceful shutdown...` });

    // 1. Stop nhận requests mới
    if (server) {
      server.close(() => {
        logger.info("HTTP server closed");
      });
    }

    // 2. Đợi requests hiện tại hoàn thành (có timeout)
    const shutdownTimeout = setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, timeout);

    try {
      // 3. Close RabbitMQ connections
      if (rabbitmq) {
        logger.info("Closing RabbitMQ connection...");
        await rabbitmq.close();
        logger.info("RabbitMQ connection closed");
      }

      // 4. Close database connections
      if (db) {
        logger.info("Closing database connection...");
        await db.close();
        logger.info("Database connection closed");
      }

      // 5. Close Redis (nếu có)
      if (redis) {
        logger.info("Closing Redis connection...");
        await redis.quit();
        logger.info("Redis connection closed");
      }

      // 6. Close HTTP connections
      for (const connection of connections) {
        connection.destroy();
      }

      clearTimeout(shutdownTimeout);
      logger.info("Graceful shutdown completed");
      process.exit(0);
    } catch (err) {
      logger.error({ msg: "Error during shutdown", error: err.message });
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Xử lý uncaught exception
  process.on("uncaughtException", (err) => {
    logger.error({ msg: "Uncaught Exception", error: err.message, stack: err.stack });
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error({ msg: "Unhandled Rejection", reason: String(reason) });
  });
}
