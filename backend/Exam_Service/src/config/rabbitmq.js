import amqp from "amqplib";
import { createDomainEventPublisher } from "../../../shared/utils/domainEventPublisher.js";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASSWORD || "StrongPassword123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

const publisher = createDomainEventPublisher({
  amqp,
  serviceName: "Exam_Service",
  url: RABBITMQ_URL,
  exchange: process.env.RABBITMQ_EXCHANGE || "examora.topic",
});

export const EXAM_EVENTS = Object.freeze({
  CREATED: "exam.created",
  UPDATED: "exam.updated",
  DELETED: "exam.deleted",
  COMPLETED: "exam.completed",
});

function publishExamEvent(routingKey, aggregateId, data, context = {}) {
  return publisher.publishSafely({
    routingKey,
    aggregateType: routingKey === EXAM_EVENTS.COMPLETED ? "attempt" : "exam",
    aggregateId,
    traceId: context.traceId,
    requestId: context.requestId,
    data,
  });
}

export const publishExamCreated = (exam, context) =>
  publishExamEvent(EXAM_EVENTS.CREATED, exam.examId, exam, context);

export const publishExamUpdated = (exam, changedFields, context) =>
  publishExamEvent(
    EXAM_EVENTS.UPDATED,
    exam.examId,
    {
      exam_id: exam.examId,
      changed_fields: changedFields,
      published: exam.published,
    },
    context,
  );

export const publishExamDeleted = (examId, teacherId, context) =>
  publishExamEvent(
    EXAM_EVENTS.DELETED,
    examId,
    {
      exam_id: examId,
      deleted_by: teacherId,
    },
    context,
  );

export const publishExamCompleted = (result, context) =>
  publishExamEvent(
    EXAM_EVENTS.COMPLETED,
    result.attemptId,
    result,
    context,
  );

export const closeRabbitMQ = () => publisher.close();

export default {
  EXAM_EVENTS,
  publishExamCreated,
  publishExamUpdated,
  publishExamDeleted,
  publishExamCompleted,
  closeRabbitMQ,
};
