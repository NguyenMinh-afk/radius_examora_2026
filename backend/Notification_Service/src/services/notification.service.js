/**
 * Notification Service - Business logic cho notifications
 */
import { publishNotification, publishEmail } from "../config/rabbitmq.js";
import { Notification } from "../models/index.js";

class NotificationService {

  /**
   * Lấy danh sách notifications của user
   */
  async getNotifications(userId, options = {}) {
    const { limit = 50, offset = 0, unreadOnly = false } = options;

    const where = { user_id: userId };
    if (unreadOnly) {
      where.is_read = false;
    }

    const { rows: notifications, count: total } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset,
      limit,
    });

    return {
      notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + notifications.length < total,
      },
    };
  }

  /**
   * Lấy số notification chưa đọc
   */
  async getUnreadCount(userId) {
    return Notification.count({ where: { user_id: userId, is_read: false } });
  }

  /**
   * Đánh dấu notification là đã đọc
   */
  async markAsRead(notificationId, userId) {
    const [updated] = await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { id: notificationId, user_id: userId } }
    );
    return updated > 0;
  }

  /**
   * Đánh dấu tất cả notifications là đã đọc
   */
  async markAllAsRead(userId) {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: userId, is_read: false } }
    );
    return { success: true };
  }

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
