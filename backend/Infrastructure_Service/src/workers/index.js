/**
 * Infrastructure Workers Index
 * Khởi động tất cả queue consumers
 */
import { connectRabbitMQ, setupExchangesAndQueues, closeRabbitMQ } from '../config/rabbitmq.js';
import { closeDatabase } from '../config/db.js';
import { startInfrastructureConsumers } from './registry.js';
import { stopOutboxWorker } from './outbox.worker.js';

/**
 * Khởi động tất cả workers
 */
async function startWorkers() {
  console.log('[Workers] Starting Infrastructure Workers...');

  try {
    // 1. Kết nối RabbitMQ
    console.log('[Workers] Connecting to RabbitMQ...');
    await connectRabbitMQ();

    // 2. Setup exchanges và queues
    console.log('[Workers] Setting up exchanges and queues...');
    await setupExchangesAndQueues();

    // 3. Khởi động các consumers
    console.log('[Workers] Starting queue consumers...');

    await startInfrastructureConsumers();

    console.log('[Workers] All workers started successfully!');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('[Workers] Shutting down gracefully...');
      await stopOutboxWorker();
      await closeRabbitMQ();
      await closeDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('[Workers] Shutting down gracefully...');
      await stopOutboxWorker();
      await closeRabbitMQ();
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error('[Workers] Failed to start workers:', error.message);
    process.exit(1);
  }
}

// Chạy workers
startWorkers();
