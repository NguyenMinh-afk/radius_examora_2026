import sequelize from './sequelize.js';
import { createOutboxWriter } from '../../../shared/utils/outbox.js';

const writer = createOutboxWriter({
  sequelize,
  serviceName: 'User_Service',
  exchange: process.env.RABBITMQ_EXCHANGE || 'examora.topic',
});

export const USER_EVENTS = Object.freeze({
  CREATED: 'user.created',
});

export function enqueueUserCreated(user, context = {}, transaction) {
  return writer.enqueue({
    routingKey: USER_EVENTS.CREATED,
    aggregateType: 'user',
    aggregateId: user.id,
    traceId: context.traceId,
    requestId: context.requestId,
    transaction,
    data: {
      user_id: user.id,
      role: user.role,
      approval_status: user.approvalStatus,
      email_verified: Boolean(user.emailVerified),
      registration_method: user.registrationMethod || 'password',
    },
  });
}

export default {
  USER_EVENTS,
  enqueueUserCreated,
};
