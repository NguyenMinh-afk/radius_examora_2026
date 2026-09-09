/**
 * Notification Pusher - Gửi notification tới WebSocket clients
 * Singleton - export một instance duy nhất
 */
import wsManager from "./manager.js";

class NotificationPusher {
  /**
   * Push notification tới user qua WebSocket
   * Được gọi sau khi notification được lưu vào DB
   */
  pushToUser(userId, notification) {
    const payload = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: false,
      createdAt: notification.created_at || notification.createdAt,
      actionUrl: notification.action_url || notification.actionUrl || null,
      metadata: notification.metadata || notification.action_data || null,
    };

    const result = wsManager.sendToUser(userId, payload);
    return result;
  }

  /**
   * Push nhiều notifications tới user
   */
  pushBatch(userId, notifications) {
    let totalDelivered = 0;
    for (const notification of notifications) {
      const result = this.pushToUser(userId, notification);
      totalDelivered += result.delivered;
    }
    return { delivered: totalDelivered };
  }

  /**
   * Broadcast tới tất cả connected users
   */
  broadcast(message) {
    return wsManager.broadcast(message);
  }

  /**
   * Lấy thống kê WebSocket connections
   */
  getStats() {
    return wsManager.getStats();
  }
}

export default new NotificationPusher();
