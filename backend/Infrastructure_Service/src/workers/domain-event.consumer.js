import { getChannel, QUEUES, ROUTING_KEYS } from '../config/rabbitmq.js';
import { startEventConsumer } from './event.consumer.js';

export const DOMAIN_EVENT_CONSUMER = 'domain-events-consumer';

export const DOMAIN_EVENT_TYPES = new Set([
  ROUTING_KEYS.USER_CREATED,
  ROUTING_KEYS.USER_UPDATED,
  ROUTING_KEYS.EXAM_CREATED,
  ROUTING_KEYS.EXAM_UPDATED,
  ROUTING_KEYS.EXAM_DELETED,
  ROUTING_KEYS.QUESTION_CREATED,
  ROUTING_KEYS.QUESTION_UPDATED,
  ROUTING_KEYS.QUESTION_DELETED,
]);

export async function startDomainEventConsumer() {
  await startEventConsumer({
    channel: getChannel(),
    queue: QUEUES.DOMAIN_EVENTS,
    retryQueue: QUEUES.DOMAIN_EVENTS_RETRY,
    consumerName: DOMAIN_EVENT_CONSUMER,
    allowedEventTypes: DOMAIN_EVENT_TYPES,
  });
  console.log(`[${DOMAIN_EVENT_CONSUMER}] Listening on ${QUEUES.DOMAIN_EVENTS}`);
}

export default { startDomainEventConsumer };
