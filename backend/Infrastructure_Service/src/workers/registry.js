import { startEmailConsumer } from './email.consumer.js';
import { startNotificationConsumer } from './notification.consumer.js';
import { startDomainEventConsumer } from './domain-event.consumer.js';
import { startExamResultsConsumer } from './exam-results.consumer.js';
import { startOutboxWorker, stopOutboxWorker } from './outbox.worker.js';

export const INFRASTRUCTURE_CONSUMERS = Object.freeze([
  'email.send',
  'notification.send',
  'domain.events',
  'exam.results',
  'outbox.publisher',
]);

export async function startInfrastructureConsumers() {
  await Promise.all([
    startEmailConsumer(),
    startNotificationConsumer(),
    startDomainEventConsumer(),
    startExamResultsConsumer(),
    startOutboxWorker(),
  ]);
}

export async function stopInfrastructureConsumers() {
  await stopOutboxWorker();
}

export default {
  INFRASTRUCTURE_CONSUMERS,
  startInfrastructureConsumers,
  stopInfrastructureConsumers,
};
