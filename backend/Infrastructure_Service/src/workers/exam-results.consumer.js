import { getChannel, QUEUES, ROUTING_KEYS } from '../config/rabbitmq.js';
import { startEventConsumer } from './event.consumer.js';

export const EXAM_RESULTS_CONSUMER = 'exam-results-consumer';
export const EXAM_RESULT_EVENT_TYPES = new Set([ROUTING_KEYS.EXAM_COMPLETED]);

export async function startExamResultsConsumer() {
  await startEventConsumer({
    channel: getChannel(),
    queue: QUEUES.EXAM_RESULTS,
    retryQueue: QUEUES.EXAM_RESULTS_RETRY,
    consumerName: EXAM_RESULTS_CONSUMER,
    allowedEventTypes: EXAM_RESULT_EVENT_TYPES,
  });
  console.log(`[${EXAM_RESULTS_CONSUMER}] Listening on ${QUEUES.EXAM_RESULTS}`);
}

export default { startExamResultsConsumer };
