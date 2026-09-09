import {
  closeRabbitMQ,
  connectRabbitMQ,
  getRabbitMQStatus,
  setRabbitMQDisconnectHandler,
  setupExchangesAndQueues,
} from '../config/rabbitmq.js';
import {
  startInfrastructureConsumers,
  stopInfrastructureConsumers,
} from './registry.js';

const DEFAULT_INITIAL_ATTEMPTS = Number(process.env.RABBITMQ_INITIAL_RETRIES || 5);
const DEFAULT_BASE_DELAY_MS = Number(process.env.RABBITMQ_RECONNECT_BASE_DELAY_MS || 1_000);
const DEFAULT_MAX_DELAY_MS = Number(process.env.RABBITMQ_RECONNECT_MAX_DELAY_MS || 30_000);

let stopped = true;
let consumersReady = false;
let reconnecting = false;
let recoveryPromise = null;
let reconnectTimer = null;
let rabbitMQUrl = process.env.RABBITMQ_URL;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function reconnectDelay(attempt) {
  return Math.min(DEFAULT_BASE_DELAY_MS * 2 ** Math.max(attempt - 1, 0), DEFAULT_MAX_DELAY_MS);
}

async function connectAndStart() {
  await stopInfrastructureConsumers();
  await connectRabbitMQ(rabbitMQUrl);
  await setupExchangesAndQueues();
  await startInfrastructureConsumers();
  consumersReady = true;
}

async function recover({ maxAttempts = Number.POSITIVE_INFINITY } = {}) {
  if (recoveryPromise) {
    return recoveryPromise;
  }

  recoveryPromise = (async () => {
    reconnecting = true;
    let attempt = 0;

    while (!stopped && attempt < maxAttempts) {
      attempt += 1;
      try {
        console.log(`[RabbitMQ Supervisor] Connecting (${attempt}/${maxAttempts})...`);
        await connectAndStart();
        console.log('[RabbitMQ Supervisor] Connection and consumers are ready');
        return true;
      } catch (error) {
        consumersReady = false;
        console.error(`[RabbitMQ Supervisor] Recovery attempt ${attempt} failed:`, error.message);
        await closeRabbitMQ();

        if (!stopped && attempt < maxAttempts) {
          await delay(reconnectDelay(attempt));
        }
      }
    }

    return false;
  })().finally(() => {
    reconnecting = false;
    recoveryPromise = null;
  });

  return recoveryPromise;
}

function scheduleRecovery() {
  if (stopped || reconnectTimer || recoveryPromise) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void recover().catch((error) => {
      console.error('[RabbitMQ Supervisor] Background recovery failed:', error.message);
    });
  }, 0);
  reconnectTimer.unref?.();
}

function handleDisconnect(error) {
  consumersReady = false;
  console.warn('[RabbitMQ Supervisor] Connection lost:', error?.message || 'unknown error');
  void stopInfrastructureConsumers().finally(scheduleRecovery);
}

export async function startRabbitMQSupervisor({
  url = process.env.RABBITMQ_URL,
  initialAttempts = DEFAULT_INITIAL_ATTEMPTS,
} = {}) {
  if (!stopped) {
    return getRabbitMQSupervisorStatus();
  }

  stopped = false;
  rabbitMQUrl = url;
  setRabbitMQDisconnectHandler(handleDisconnect);

  const connected = await recover({ maxAttempts: initialAttempts });
  if (!connected && !stopped) {
    console.warn('[RabbitMQ Supervisor] Initial attempts exhausted; continuing in background');
    scheduleRecovery();
  }

  return getRabbitMQSupervisorStatus();
}

export async function stopRabbitMQSupervisor() {
  stopped = true;
  consumersReady = false;
  setRabbitMQDisconnectHandler(null);

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  await stopInfrastructureConsumers();
  await closeRabbitMQ();
}

export function getRabbitMQSupervisorStatus() {
  const rabbitStatus = getRabbitMQStatus();
  return {
    connected: rabbitStatus.connected,
    consumersReady: rabbitStatus.connected && consumersReady,
    reconnecting,
  };
}

export default {
  getRabbitMQSupervisorStatus,
  startRabbitMQSupervisor,
  stopRabbitMQSupervisor,
};
