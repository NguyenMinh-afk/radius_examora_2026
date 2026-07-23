import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  closeRabbitMQ: vi.fn(),
  connectRabbitMQ: vi.fn(),
  connected: false,
  disconnectHandler: null,
  setupExchangesAndQueues: vi.fn(),
  startInfrastructureConsumers: vi.fn(),
  stopInfrastructureConsumers: vi.fn(),
}));

vi.mock('../src/config/rabbitmq.js', () => ({
  closeRabbitMQ: mocks.closeRabbitMQ,
  connectRabbitMQ: mocks.connectRabbitMQ,
  getRabbitMQStatus: () => ({
    connected: mocks.connected,
    channelOpen: mocks.connected,
  }),
  setRabbitMQDisconnectHandler: (handler) => {
    mocks.disconnectHandler = handler;
  },
  setupExchangesAndQueues: mocks.setupExchangesAndQueues,
}));

vi.mock('../src/workers/registry.js', () => ({
  startInfrastructureConsumers: mocks.startInfrastructureConsumers,
  stopInfrastructureConsumers: mocks.stopInfrastructureConsumers,
}));

import {
  getRabbitMQSupervisorStatus,
  startRabbitMQSupervisor,
  stopRabbitMQSupervisor,
} from '../src/workers/rabbitmq.supervisor.js';

describe('RabbitMQ supervisor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connected = false;
    mocks.disconnectHandler = null;
    mocks.closeRabbitMQ.mockImplementation(async () => {
      mocks.connected = false;
    });
    mocks.connectRabbitMQ.mockImplementation(async () => {
      mocks.connected = true;
      return {};
    });
    mocks.setupExchangesAndQueues.mockResolvedValue(undefined);
    mocks.startInfrastructureConsumers.mockResolvedValue(undefined);
    mocks.stopInfrastructureConsumers.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await stopRabbitMQSupervisor();
  });

  it('connects, declares topology and starts all consumers', async () => {
    const status = await startRabbitMQSupervisor({
      url: 'amqp://rabbitmq',
      initialAttempts: 1,
    });

    expect(mocks.connectRabbitMQ).toHaveBeenCalledWith('amqp://rabbitmq');
    expect(mocks.setupExchangesAndQueues).toHaveBeenCalledOnce();
    expect(mocks.startInfrastructureConsumers).toHaveBeenCalledOnce();
    expect(status).toEqual({
      connected: true,
      consumersReady: true,
      reconnecting: false,
    });
  });

  it('reconnects and restarts consumers after the broker connection closes', async () => {
    await startRabbitMQSupervisor({
      url: 'amqp://rabbitmq',
      initialAttempts: 1,
    });
    mocks.connected = false;

    mocks.disconnectHandler(new Error('broker restarted'));

    expect(getRabbitMQSupervisorStatus().consumersReady).toBe(false);
    await vi.waitFor(() => {
      expect(mocks.connectRabbitMQ).toHaveBeenCalledTimes(2);
      expect(mocks.startInfrastructureConsumers).toHaveBeenCalledTimes(2);
    });
    expect(getRabbitMQSupervisorStatus()).toEqual({
      connected: true,
      consumersReady: true,
      reconnecting: false,
    });
  });
});
