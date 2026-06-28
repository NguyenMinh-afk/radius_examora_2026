/**
 * Notification Service - Business logic cho notifications
 */
import { publishNotification, publishEmail } from "../config/rabbitmq.js";

class NotificationService {

  /**
   * Gửi notification qua queue (async)
   */
  async sendNotification(userId, type, title, content, metadata = {}) {
    try {
      await publishNotification({
        userId,
        type,
        title,
        content,
        metadata,
        traceId: metadata.traceId,
      });
      return { success: true, message: "Notification queued" };
    } catch (error) {
      console.error("[NotificationService] Failed to queue notification:", error.message);
      throw error;
    }
  }

  /**
   * Gửi email qua queue (async)
   */
  async sendEmail(to, subject, html, text = "") {
    try {
      await publishEmail({
        to,
        subject,
        html,
        text,
      });
      return { success: true, message: "Email queued" };
    } catch (error) {
      console.error("[NotificationService] Failed to queue email:", error.message);
      throw error;
    }
  }
}

export default new NotificationService();
