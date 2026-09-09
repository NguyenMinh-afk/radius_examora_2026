import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createRequest: vi.fn(),
  createTask: vi.fn(),
  publish: vi.fn(),
}));

vi.mock('../src/models/index.js', () => ({
  AIGenerationRequest: {
    create: mocks.createRequest,
  },
  AIGenerationTask: {
    create: mocks.createTask,
  },
  GeneratedQuestion: {},
  AIGenerationLog: {},
}));

vi.mock('../src/config/rabbitmq.js', () => ({
  publishAIGeneration: mocks.publish,
}));

import aiService from '../src/services/ai.service.js';

describe('AIService.createGenerationRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createRequest.mockResolvedValue({ id: 'request-id' });
    mocks.createTask.mockResolvedValue({ id: 'task-id' });
    mocks.publish.mockResolvedValue();
  });

  it('keeps text context on the request and leaves input_reference empty', async () => {
    const result = await aiService.createGenerationRequest('user-id', {
      courseId: 42,
      questionType: 'multiple_choice',
      difficulty: 'medium',
      quantity: 2,
      context: 'JavaScript async/await context',
    });

    expect(mocks.createRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        context: 'JavaScript async/await context',
      }),
    );
    expect(mocks.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        request_id: 'request-id',
        input_type: 'text',
        input_reference: null,
      }),
    );
    expect(mocks.publish).toHaveBeenCalledWith({
      requestId: 'request-id',
      taskId: 'task-id',
      traceId: expect.any(String),
    });
    expect(result).toEqual(
      expect.objectContaining({
        requestId: 'request-id',
        taskId: 'task-id',
        status: 'pending',
      }),
    );
  });
});
