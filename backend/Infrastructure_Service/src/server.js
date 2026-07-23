/**
 * Infrastructure_Service
 * CHỦ YẾU chứa hạ tầng: queue consumers, email workers, cleanup jobs
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Shared modules
import { validateServiceEnv } from '../../shared/utils/env.validator.js';
import { requestIdMiddleware, correlationIdMiddleware } from '../../shared/middleware/requestId.js';
import { generalLimiter } from '../../shared/middleware/rateLimiter.js';
import { default as logger, log } from '../../shared/utils/logger.js';

dotenv.config();

// Validate environment variables
validateServiceEnv('infrastructureService');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5005;
let server = null;

// Request ID & Correlation ID
app.use(requestIdMiddleware);
app.use(correlationIdMiddleware);

// Security headers (production only)
if (isProduction) {
  app.use(helmet());
  app.set('trust proxy', 1);
}

// Compression (production only)
if (isProduction) {
  app.use(compression());
}

// Disable x-powered-by header
app.disable('x-powered-by');

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
app.use(generalLimiter);

// Health check endpoints
app.get('/', (req, res) => res.send('Examora Infrastructure_Service is running...'));

app.get('/health', (req, res) => {
  const rabbitMQ = getRabbitMQSupervisorStatus();
  res.json({
    status: 'ok',
    service: 'Infrastructure_Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    rabbitmq: rabbitMQ.connected ? 'connected' : 'disconnected',
    consumers: rabbitMQ.consumersReady ? 'running' : 'stopped',
    reconnecting: rabbitMQ.reconnecting,
  });
});

app.get('/ready', (req, res) => {
  const rabbitMQ = getRabbitMQSupervisorStatus();
  const ready = rabbitMQ.connected && rabbitMQ.consumersReady;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    service: 'Infrastructure_Service',
    rabbitmq: rabbitMQ.connected,
    consumers: rabbitMQ.consumersReady,
    reconnecting: rabbitMQ.reconnecting,
  });
});

// Liveness probe
app.get('/live', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Import RabbitMQ utilities từ shared
import { closeDatabase } from './config/db.js';
import {
  getRabbitMQSupervisorStatus,
  startRabbitMQSupervisor,
  stopRabbitMQSupervisor,
} from './workers/rabbitmq.supervisor.js';

/**
 * Start Infrastructure Service
 */
async function startInfrastructure() {
  log.info('Starting Infrastructure Service...');

  // Start HTTP server
  server = app.listen(PORT, () => {
    log.service.started(PORT);
  });

  const rabbitMQ = await startRabbitMQSupervisor();
  if (rabbitMQ.consumersReady) {
    log.service.rabbitmqConnected();
    log.info('All consumers started successfully!');
  } else {
    log.warn('RabbitMQ is not ready yet; supervisor will keep reconnecting');
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
      log.info('HTTP server closed');
    });
  }

  try {
    await stopRabbitMQSupervisor();
    log.info('RabbitMQ connection closed');

    await closeDatabase();
    log.info('Database pool closed');

    log.service.shutdown();
    process.exit(0);
  } catch (error) {
    log.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
}

// Signal handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  log.error('Uncaught Exception', { error: err.message, stack: err.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection', { reason: String(reason) });
});

// Start
startInfrastructure();

export default app;
