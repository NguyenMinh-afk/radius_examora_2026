import {
  NonRetryableMessageError,
  parseAndValidateEvent,
  storeSystemEvent,
} from '../services/system-event.service.js';

export const MAX_EVENT_RETRIES = 3;

function getRetryCount(message) {
  const value = Number(message.properties.headers?.['x-retry-count'] || 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

async function scheduleRetry({ channel, message, retryQueue, retryCount, consumerName }) {
  try {
    channel.sendToQueue(retryQueue, message.content, {
      ...message.properties,
      persistent: true,
      headers: {
        ...(message.properties.headers || {}),
        'x-retry-count': retryCount + 1,
        'x-last-consumer': consumerName,
      },
    });
    await channel.waitForConfirms();
    channel.ack(message);
  } catch (error) {
    console.error(`[${consumerName}] Failed to schedule retry; sending to DLQ:`, error.message);
    channel.nack(message, false, false);
  }
}

export async function handleEventMessage({
  channel,
  message,
  retryQueue,
  consumerName,
  allowedEventTypes,
}) {
  if (!message) {
    return;
  }

  try {
    const { event, messageId } = parseAndValidateEvent(message, allowedEventTypes);
    const result = await storeSystemEvent({
      event,
      messageId,
      consumerName,
    });

    if (result.duplicate) {
      console.log(`[${consumerName}] Duplicate ACK: ${messageId}`);
    } else {
      console.log(`[${consumerName}] Processed ${event.event_type}: ${messageId}`);
    }
    channel.ack(message);
  } catch (error) {
    if (error instanceof NonRetryableMessageError) {
      console.error(`[${consumerName}] Invalid message; sending to DLQ:`, error.message);
      channel.nack(message, false, false);
      return;
    }

    const retryCount = getRetryCount(message);
    if (retryCount >= MAX_EVENT_RETRIES) {
      console.error(`[${consumerName}] Retry limit reached; sending to DLQ:`, error.message);
      channel.nack(message, false, false);
      return;
    }

    console.warn(
      `[${consumerName}] Temporary failure; scheduling retry ${retryCount + 1}/${MAX_EVENT_RETRIES}:`,
      error.message
    );
    await scheduleRetry({
      channel,
      message,
      retryQueue,
      retryCount,
      consumerName,
    });
  }
}

export async function startEventConsumer({
  channel,
  queue,
  retryQueue,
  consumerName,
  allowedEventTypes,
}) {
  await channel.consume(
    queue,
    (message) =>
      handleEventMessage({
        channel,
        message,
        retryQueue,
        consumerName,
        allowedEventTypes,
      }),
    { noAck: false }
  );
}

export default {
  MAX_EVENT_RETRIES,
  handleEventMessage,
  startEventConsumer,
};
