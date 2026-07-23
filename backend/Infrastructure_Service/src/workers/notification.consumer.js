/**
 * Notification Queue Consumer
 * Xử lý việc tạo notification bất đồng bộ qua RabbitMQ
 */
import axios from "axios";
import { getChannel, QUEUES } from "../config/rabbitmq.js";

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004";

/**
 * Xử lý message tạo notification
 */
async function processNotificationMessage(msg) {
  const content = JSON.parse(msg.content.toString());

  const { userId, type, title, content: notifContent, metadata } = content;

  if (!userId || !title || !notifContent) {
    console.error("[NotificationConsumer] Missing required fields");
    return false;
  }

  try {
    // Gọi Notification Service để tạo notification
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/internal`,
      {
        user_id: userId,
        type: type || "system",
        title,
        content: notifContent,
        metadata: metadata || {},
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log(`[NotificationConsumer] Notification created: ${response.data?.id || "success"}`);
    return true;
  } catch (error) {
    console.error("[NotificationConsumer] Failed to create notification:", error.message);
    return false;
  }
}

/**
 * Khởi động Notification Consumer
 */
export async function startNotificationConsumer() {
  const channel = getChannel();

  console.log("[NotificationConsumer] Starting notification consumer...");

  await channel.consume(QUEUES.NOTIFICATION_SEND, async (msg) => {
    if (!msg) return;

    try {
      const success = await processNotificationMessage(msg);

      if (success) {
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
    } catch (error) {
      console.error("[NotificationConsumer] Error processing message:", error.message);
      channel.nack(msg, false, false);
    }
  });

  console.log("[NotificationConsumer] Notification consumer started on queue:", QUEUES.NOTIFICATION_SEND);
}

export default { startNotificationConsumer };
