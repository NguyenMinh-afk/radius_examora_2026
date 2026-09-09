import { closeDatabase } from '../config/db.js';
import {
  startRabbitMQSupervisor,
  stopRabbitMQSupervisor,
} from './rabbitmq.supervisor.js';

async function shutdown(signal) {
  console.log(`[Workers] Received ${signal}; shutting down gracefully...`);
  await stopRabbitMQSupervisor();
  await closeDatabase();
  process.exit(0);
}

async function startWorkers() {
  console.log('[Workers] Starting Infrastructure workers...');

  try {
    const status = await startRabbitMQSupervisor();
    console.log(
      status.consumersReady
        ? '[Workers] All workers started successfully'
        : '[Workers] RabbitMQ supervisor is reconnecting in the background'
    );

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Workers] Failed to start workers:', error.message);
    process.exit(1);
  }
}

void startWorkers();
