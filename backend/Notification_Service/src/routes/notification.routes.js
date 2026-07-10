/**
 * Notification Routes - API endpoints cho Notification Module
 * Mount: /api/notifications/*
 * ESM - Notifications thuộc Notification_Service, không phải Exam_Service
 */
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import notificationService from "../services/notification.service.js";

const router = express.Router();

// Các endpoint đọc/đánh dấu cần auth của user hiện tại
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = "false" } = req.query;
    const userId = req.user.id;
    const data = await notificationService.getNotifications(userId, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      unreadOnly: unreadOnly === "true",
    });

    const items = (data.items || []).map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.is_read,
      createdAt: notification.created_at ? new Date(notification.created_at).toISOString() : new Date().toISOString(),
      actionUrl: notification.action_url || null,
    }));

    res.json({
      items,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      hasMore: data.hasMore,
    });
  } catch (error) {
    console.error("[Notification] getNotifications error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error("[Notification] getUnreadCount error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const success = await notificationService.markAsRead(id, userId);
    if (!success) {
      return res.status(404).json({ error: "Notification not found or already read" });
    }
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("[Notification] markAsRead error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    const userId = req.user.id;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("[Notification] markAllAsRead error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Endpoint nội bộ cho các service khác gọi trực tiếp, KHÔNG yêu cầu auth
router.post("/internal", async (req, res) => {
  try {
    const { user_id, type, title, content, metadata = {} } = req.body || {};

    if (!user_id || !title || !content) {
      return res.status(400).json({ error: "Missing required notification fields" });
    }

    const allowedTypes = [
      "assignment",
      "grade",
      "ai_complete",
      "system",
      "verification",
      "password_reset",
      "email",
      "class_post",
      "exam_submit",
    ];
    const safeType = allowedTypes.includes(type) ? type : "system";

    const notification = await Notification.create({
      user_id,
      type: safeType,
      title,
      message: content,
      action_url: metadata.action_url || null,
      action_data: metadata.action_data || null,
      is_read: false,
    });

    res.status(201).json({
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.is_read,
      createdAt: notification.created_at ? new Date(notification.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Notification] create notification error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
