/**
 * Notification Service - Business logic cho Notification Module
 * ESM - Xử lý notification CRUD, không chứa exam/user/auth
 */
import { Notification } from "../models/index.js";
import { Op } from "sequelize";

class NotificationService {

  async getNotifications(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
    const where = { user_id: userId };
    if (unreadOnly) {
      where.read_at = null;
    }

    const { rows: items, count: total } = await Notification.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const unreadCount = await Notification.count({
      where: { user_id: userId, read_at: null },
    });

    return {
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        message: n.message,
        actionUrl: n.action_url,
        actionData: n.action_data,
        isRead: !!n.read_at,
        readAt: n.read_at,
        createdAt: n.created_at,
      })),
      total,
      unreadCount,
    };
  }

  async getUnreadCount(userId) {
    return Notification.count({
      where: { user_id: userId, read_at: null },
    });
  }

  async markAsRead(notificationId, userId) {
    const [updated] = await Notification.update(
      { read_at: new Date() },
      {
        where: {
          id: notificationId,
          user_id: userId,
          read_at: null,
        },
      }
    );
    return updated > 0;
  }

  async markAllAsRead(userId) {
    await Notification.update(
      { read_at: new Date() },
      {
        where: {
          user_id: userId,
          read_at: null,
        },
      }
    );
  }

  async createNotification({ userId, type, message, actionUrl = null, actionData = null }) {
    return Notification.create({
      user_id: userId,
      type,
      message,
      action_url: actionUrl,
      action_data: actionData,
    });
  }
}

export default new NotificationService();
