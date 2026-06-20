import { Notification, Op } from "../models/index.js";

const parsePositiveInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
};

const paginationResponse = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export const getMyNotifications = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 10, 50);
    const offset = (page - 1) * limit;
    const unreadOnly = req.query.unread_only === "true";

    const where = {
      user_id: req.user?.id,
    };

    if (unreadOnly) where.is_read = false;

    const result = await Notification.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      notifications: result.rows,
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.user?.id,
      },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.update({ is_read: true, read_at: new Date() });
    return res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const [updatedCount] = await Notification.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          user_id: req.user?.id,
          is_read: false,
          id: { [Op.ne]: null },
        },
      }
    );

    return res.json({
      message: "Notifications marked as read",
      updated_count: updatedCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update notifications",
      error: error.message,
    });
  }
};
