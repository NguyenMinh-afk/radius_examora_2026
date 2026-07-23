import { startEmailConsumer } from './email.consumer.js';
import { startNotificationConsumer } from './notification.consumer.js';

export const INFRASTRUCTURE_CONSUMERS = Object.freeze(['email.send', 'notification.send']);

export async function startInfrastructureConsumers() {
  await Promise.all([startEmailConsumer(), startNotificationConsumer()]);
}

export default {
  INFRASTRUCTURE_CONSUMERS,
  startInfrastructureConsumers,
};
