import sequelize from './sequelize.js';
import { createOutboxWriter } from '../../../shared/utils/outbox.js';

const writer = createOutboxWriter({
  sequelize,
  serviceName: 'Exam_Service',
  exchange: process.env.RABBITMQ_EXCHANGE || 'examora.topic',
});

export const EXAM_EVENTS = Object.freeze({
  CREATED: 'exam.created',
  UPDATED: 'exam.updated',
  DELETED: 'exam.deleted',
  COMPLETED: 'exam.completed',
});

function enqueueExamEvent(routingKey, aggregateId, data, context = {}, transaction) {
  return writer.enqueue({
    routingKey,
    aggregateType: routingKey === EXAM_EVENTS.COMPLETED ? 'attempt' : 'exam',
    aggregateId,
    traceId: context.traceId,
    requestId: context.requestId,
    data,
    transaction,
  });
}

export const enqueueExamCreated = (exam, context, transaction) =>
  enqueueExamEvent(EXAM_EVENTS.CREATED, exam.examId, exam, context, transaction);

export const enqueueExamUpdated = (exam, changedFields, context, transaction) =>
  enqueueExamEvent(
    EXAM_EVENTS.UPDATED,
    exam.examId,
    {
      exam_id: exam.examId,
      changed_fields: changedFields,
      published: exam.published,
    },
    context,
    transaction
  );

export const enqueueExamDeleted = (examId, teacherId, context, transaction) =>
  enqueueExamEvent(
    EXAM_EVENTS.DELETED,
    examId,
    {
      exam_id: examId,
      deleted_by: teacherId,
    },
    context,
    transaction
  );

export const enqueueExamCompleted = (result, context, transaction) =>
  enqueueExamEvent(EXAM_EVENTS.COMPLETED, result.attemptId, result, context, transaction);

export default {
  EXAM_EVENTS,
  enqueueExamCreated,
  enqueueExamUpdated,
  enqueueExamDeleted,
  enqueueExamCompleted,
};
