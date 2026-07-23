import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  query: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('../src/models/index.js', () => ({
  Notification: {
    create: mocks.create,
  },
  sequelize: {
    query: mocks.query,
    transaction: mocks.transaction,
  },
}));

vi.mock('../src/middleware/auth.middleware.js', () => ({
  authenticate: vi.fn((_req, _res, next) => next()),
}));

import notificationRoutes from '../src/routes/notification.routes.js';

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Internal notification idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(async (callback) => callback('transaction'));
    mocks.create.mockResolvedValue({
      id: 'notification-id',
      user_id: '10000000-0000-4000-8000-000000000001',
      type: 'system',
      title: 'Title',
      message: 'Content',
      is_read: false,
      created_at: new Date('2026-07-23T00:00:00.000Z'),
    });
  });

  it('stores message idempotency and notification in one transaction', async () => {
    mocks.query.mockResolvedValue([[{ processed_message_id: 'processed-id' }], undefined]);

    const response = await request(app)
      .post('/api/notifications/internal')
      .send({
        user_id: '10000000-0000-4000-8000-000000000001',
        type: 'system',
        title: 'Title',
        content: 'Content',
        message_id: 'message-id',
      });

    expect(response.status).toBe(201);
    expect(mocks.query).toHaveBeenCalledWith(
      expect.stringContaining('infra_eventing.processed_messages'),
      expect.objectContaining({
        replacements: {
          messageId: 'message-id',
        },
        transaction: 'transaction',
      })
    );
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Title' }),
      { transaction: 'transaction' }
    );
  });

  it('returns success without creating a duplicate notification', async () => {
    mocks.query.mockResolvedValue([[], undefined]);

    const response = await request(app)
      .post('/api/notifications/internal')
      .send({
        user_id: '10000000-0000-4000-8000-000000000001',
        title: 'Title',
        content: 'Content',
        message_id: 'message-id',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      duplicate: true,
      messageId: 'message-id',
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
