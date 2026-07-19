/**
 * Request ID Middleware
 * Thêm unique ID cho mỗi request để trace logs
 */
import { randomUUID } from "crypto";

export const requestIdMiddleware = (req, res, next) => {
  // Lấy từ header hoặc tạo mới
  const requestId = req.headers["x-request-id"] || randomUUID();

  // Attach vào request object
  req.requestId = requestId;

  // Response header
  res.setHeader("X-Request-ID", requestId);

  next();
};

/**
 * Correlation ID cho distributed tracing
 * Dùng khi request đi qua nhiều services
 */
export const correlationIdMiddleware = (req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || randomUUID();

  req.correlationId = correlationId;
  res.setHeader("X-Correlation-ID", correlationId);

  next();
};
