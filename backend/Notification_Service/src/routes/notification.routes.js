/**
 * Notification Routes - API endpoints cho Notification Module
 * Mount: /api/notifications/*
 * ESM - Notifications thuộc Notification_Service, không phải Exam_Service
 */
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import notificationService from "../services/notification.service.js";

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/notifications
 * Lấy danh sách notifications của user hiện tại
 * Query: limit, offset, unreadOnly
 */
router.get("/", async (req, res) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = "false" } = req.query;
    const userId = req.user.id;
    const data = await notificationService.getNotifications(userId, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      unreadOnly: unreadOnly === "true",
    });
    res.json(data);
  } catch (error) {
    console.error("[Notification] getNotifications error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

/**
 * GET /api/notifications/unread-count
 * Lấy số notification chưa đọc
 */
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

/**
 * PATCH /api/notifications/:id/read
 * Đánh dấu 1 notification là đã đọc
 */
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

/**
 * PATCH /api/notifications/read-all
 * Đánh dấu tất cả notifications là đã đọc
 */
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

export default router;
