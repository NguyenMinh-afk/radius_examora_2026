import amqp from "amqplib";
import { createDomainEventPublisher } from "../../../shared/utils/domainEventPublisher.js";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASSWORD || "StrongPassword123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

const publisher = createDomainEventPublisher({
  amqp,
  serviceName: "Question_Service",
  url: RABBITMQ_URL,
  exchange: process.env.RABBITMQ_EXCHANGE || "examora.topic",
});

export const QUESTION_EVENTS = Object.freeze({
  CREATED: "question.created",
  UPDATED: "question.updated",
  DELETED: "question.deleted",
});

function publishQuestionEvent(routingKey, questionId, data, context = {}) {
  return publisher.publishSafely({
    routingKey,
    aggregateType: "question",
    aggregateId: questionId,
    traceId: context.traceId,
    requestId: context.requestId,
    data,
  });
}

export const publishQuestionCreated = (question, userId, context) =>
  publishQuestionEvent(
    QUESTION_EVENTS.CREATED,
    question.id,
    {
      question_id: question.id,
      created_by: userId,
      question_type: question.questionType,
      difficulty: question.difficulty,
      chapter_id: question.chapterId,
    },
    context,
  );

export const publishQuestionUpdated = (
  question,
  userId,
  changedFields,
  context,
) =>
  publishQuestionEvent(
    QUESTION_EVENTS.UPDATED,
    question.id,
    {
      question_id: question.id,
      updated_by: userId,
      changed_fields: changedFields,
      question_type: question.questionType,
      difficulty: question.difficulty,
    },
    context,
  );

export const publishQuestionDeleted = (questionId, userId, context) =>
  publishQuestionEvent(
    QUESTION_EVENTS.DELETED,
    questionId,
    {
      question_id: questionId,
      deleted_by: userId,
    },
    context,
  );

export const closeRabbitMQ = () => publisher.close();

export default {
  QUESTION_EVENTS,
  publishQuestionCreated,
  publishQuestionUpdated,
  publishQuestionDeleted,
  closeRabbitMQ,
};
