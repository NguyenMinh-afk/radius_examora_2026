import axios from 'axios';
import { getChannel, QUEUES } from '../config/rabbitmq.js';
import {
  handleReliableMessage,
  NonRetryableMessageError,
} from './reliable-message.consumer.js';

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

export const NOTIFICATION_CONSUMER_NAME = 'notification-consumer';

function parseNotificationMessage(message) {
  let content;
  try {
    content = JSON.parse(message.content.toString());
  } catch {
    throw new NonRetryableMessageError('Message content is not valid JSON');
  }

  if (!content.userId || !content.title || !content.content) {
    throw new NonRetryableMessageError(
      'Missing required fields: userId, title, content'
    );
  }
  return content;
}

async function processNotificationMessage(message, messageId) {
  const {
    userId,
    type,
    title,
    content: notificationContent,
    metadata,
  } = parseNotificationMessage(message);

  const response = await axios.post(
    `${NOTIFICATION_SERVICE_URL}/api/notifications/internal`,
    {
      user_id: userId,
      type: type || 'system',
      title,
      content: notificationContent,
      metadata: metadata || {},
      message_id: messageId,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10_000,
    }
  );

  const result = response.data?.duplicate ? 'duplicate' : response.data?.id || 'success';
  console.log(`[NotificationConsumer] Notification handled: ${result}`);
}

export async function startNotificationConsumer() {
  const channel = getChannel();
  console.log('[NotificationConsumer] Starting notification consumer...');

  await channel.consume(QUEUES.NOTIFICATION_SEND, async (message) => {
    await handleReliableMessage({
      channel,
      message,
      retryQueue: QUEUES.NOTIFICATION_SEND_RETRY,
      consumerName: NOTIFICATION_CONSUMER_NAME,
      processMessage: processNotificationMessage,
    });
  });

  console.log(
    '[NotificationConsumer] Notification consumer started on queue:',
    QUEUES.NOTIFICATION_SEND
  );
}

export default { startNotificationConsumer };
