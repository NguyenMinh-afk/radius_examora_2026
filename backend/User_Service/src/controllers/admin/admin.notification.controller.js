/**
 * Admin Notification Controller
 */
import { Op } from "../../models/index.js";
import { getPagination, paginationResponse, writeAuditLog } from "./admin.shared.js";
import { BROADCAST_TARGETS } from "./admin.helpers.js";
import { Notification, Role, User } from "../../models/index.js";

const toNotificationRow = (notification) => ({
  id: notification.id,
  user_id: notification.user_id,
  recipient_name: notification.user?.full_name || null,
  recipient_email: notification.user?.email || null,
  recipient_role: notification.user?.role?.name || null,
  type: notification.type,
  target_role: notification.action_data?.target_role || null,
  title: notification.title,
  content: notification.content,
  is_read: notification.is_read,
  created_at: notification.created_at,
});

export const getAdminNotifications = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const target = String(req.query.target || "").trim().toLowerCase();
    const search = String(req.query.search || "").trim();

    const actionDataFilter = {
      source: "admin_broadcast",
    };

    const where = {
      type: "system",
      action_data: {
        [Op.contains]: actionDataFilter,
      },
    };

    if (target) {
      actionDataFilter.target_role = target;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const result = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "full_name", "role_id"],
          include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      notifications: result.rows.map(toNotificationRow),
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

export const createAdminNotification = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const content = String(req.body.content || "").trim();
    const targetRole = String(req.body.target_role || "all").trim().toLowerCase();

    if (!title || title.length > 160) {
      return res.status(400).json({ message: "title is required and must be 160 characters or less" });
    }

    if (!content || content.length > 2000) {
      return res.status(400).json({ message: "content is required and must be 2000 characters or less" });
    }

    if (!Object.hasOwn(BROADCAST_TARGETS, targetRole)) {
      return res.status(400).json({ message: "target_role must be all, teacher, or student" });
    }

    const where = { is_active: true };
    const roleNames = BROADCAST_TARGETS[targetRole];

    if (roleNames) {
      const roles = await Role.findAll({
        where: { name: { [Op.in]: roleNames } },
        attributes: ["id"],
      });

      const roleIds = roles.map((role) => role.id);
      if (roleIds.length === 0) {
        return res.status(400).json({ message: `No role found for target ${targetRole}` });
      }

      where.role_id = { [Op.in]: roleIds };
    }

    const recipients = await User.findAll({
      where,
      attributes: ["id"],
    });

    if (recipients.length === 0) {
      return res.status(400).json({ message: "No active recipients found" });
    }

    const createdAt = new Date();
    const notifications = await Notification.bulkCreate(
      recipients.map((recipient) => ({
        user_id: recipient.id,
        type: "system",
        title,
        content,
        action_data: {
          source: "admin_broadcast",
          target_role: targetRole,
        },
        is_read: false,
        created_at: createdAt,
      }))
    );

    await writeAuditLog(req, {
      action: "admin.notification.broadcast",
      entityType: "notification",
      entityId: null,
      metadata: {
        title,
        target_role: targetRole,
        recipient_count: recipients.length,
      },
    });

    return res.status(201).json({
      message: "Notification broadcast created",
      target_role: targetRole,
      recipient_count: recipients.length,
      notifications_created: notifications.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create notification broadcast",
      error: error.message,
    });
  }
};
