import sequelize from './sequelize.js';
import { createOutboxWriter } from '../../../shared/utils/outbox.js';

const writer = createOutboxWriter({
  sequelize,
  serviceName: 'Question_Service',
  exchange: process.env.RABBITMQ_EXCHANGE || 'examora.topic',
});

export const QUESTION_EVENTS = Object.freeze({
  CREATED: 'question.created',
  UPDATED: 'question.updated',
  DELETED: 'question.deleted',
});

function enqueueQuestionEvent(routingKey, questionId, data, context = {}, transaction) {
  return writer.enqueue({
    routingKey,
    aggregateType: 'question',
    aggregateId: questionId,
    traceId: context.traceId,
    requestId: context.requestId,
    data,
    transaction,
  });
}

export const enqueueQuestionCreated = (question, userId, context, transaction) =>
  enqueueQuestionEvent(
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
    transaction
  );

export const enqueueQuestionUpdated = (question, userId, changedFields, context, transaction) =>
  enqueueQuestionEvent(
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
    transaction
  );

export const enqueueQuestionDeleted = (questionId, userId, context, transaction) =>
  enqueueQuestionEvent(
    QUESTION_EVENTS.DELETED,
    questionId,
    {
      question_id: questionId,
      deleted_by: userId,
    },
    context,
    transaction
  );

export default {
  QUESTION_EVENTS,
  enqueueQuestionCreated,
  enqueueQuestionUpdated,
  enqueueQuestionDeleted,
};
