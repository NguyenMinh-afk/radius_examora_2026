import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const transaction = { id: 'transaction' };
  return {
    transaction,
    enqueueUserCreated: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    getRoleByName: vi.fn(),
    getApprovalStatusForRole: vi.fn(),
  };
});

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn().mockResolvedValue('password-hash') },
}));

vi.mock('../src/config/sequelize.js', () => ({
  default: {
    transaction: vi.fn((callback) => callback(mocks.transaction)),
  },
}));

vi.mock('../src/config/outbox.js', () => ({
  enqueueUserCreated: mocks.enqueueUserCreated,
}));

vi.mock('../src/models/User.js', () => ({
  default: {
    findOne: mocks.findOne,
    create: mocks.create,
  },
}));

vi.mock('../src/models/UserSession.js', () => ({ default: {} }));
vi.mock('../src/models/user/PasswordResetToken.js', () => ({ default: {} }));
vi.mock('../src/models/user/OAuthProvider.js', () => ({ default: {} }));
vi.mock('../src/config/jwt.js', () => ({
  generateTokens: vi.fn(),
  getRefreshTokenExpiresAt: vi.fn(),
  verifyAccessToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));
vi.mock('../src/services/email.service.js', () => ({
  sendPasswordChangedEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));
vi.mock('../src/services/auth/shared.service.js', () => ({
  assertUserCanLogin: vi.fn(),
  getApprovalStatusForRole: mocks.getApprovalStatusForRole,
  getBearerToken: vi.fn(),
  getRoleByName: mocks.getRoleByName,
}));

import { register } from '../src/services/auth/auth.service.js';

describe('User registration transactional outbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findOne.mockResolvedValue(null);
    mocks.getRoleByName.mockResolvedValue({ id: 1, name: 'student' });
    mocks.getApprovalStatusForRole.mockReturnValue('approved');
    mocks.create.mockResolvedValue({
      id: '10000000-0000-4000-8000-000000000001',
      email_verified: false,
    });
    mocks.enqueueUserCreated.mockResolvedValue({ queued: true });
  });

  it('creates the user and outbox event in the same transaction', async () => {
    await register(
      {
        email: 'student@example.com',
        password: 'password123',
        full_name: 'Student',
        role: 'student',
      },
      { traceId: 'trace-id', requestId: 'request-id' }
    );

    expect(mocks.create.mock.calls[0][1]).toEqual({
      transaction: mocks.transaction,
    });
    expect(mocks.enqueueUserCreated.mock.calls[0][2]).toBe(mocks.transaction);
  });
});
