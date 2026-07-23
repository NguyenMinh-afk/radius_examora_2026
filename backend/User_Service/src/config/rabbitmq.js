import amqp from "amqplib";
import { createDomainEventPublisher } from "../../../shared/utils/domainEventPublisher.js";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASSWORD || "StrongPassword123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

const publisher = createDomainEventPublisher({
  amqp,
  serviceName: "User_Service",
  url: RABBITMQ_URL,
  exchange: process.env.RABBITMQ_EXCHANGE || "examora.topic",
});

export const USER_EVENTS = Object.freeze({
  CREATED: "user.created",
});

export function publishUserCreated(user, context = {}) {
  return publisher.publishSafely({
    routingKey: USER_EVENTS.CREATED,
    aggregateType: "user",
    aggregateId: user.id,
    traceId: context.traceId,
    requestId: context.requestId,
    data: {
      user_id: user.id,
      role: user.role,
      approval_status: user.approvalStatus,
      email_verified: Boolean(user.emailVerified),
      registration_method: user.registrationMethod || "password",
    },
  });
}

export const closeRabbitMQ = () => publisher.close();

export default {
  USER_EVENTS,
  publishUserCreated,
  closeRabbitMQ,
};
