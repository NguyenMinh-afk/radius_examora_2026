import {
  AIJob,
  AuditLog,
  Course,
  Notification,
  Op,
  QueueJob,
  Role,
  SystemEvent,
  User,
} from "../models/index.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parsePositiveInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
};

const parseBooleanFilter = (value) => {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const getPagination = (query) => {
  const page = parsePositiveInt(query.page, 1);
  const limit = parsePositiveInt(query.limit, 10, 100);
  return { page, limit, offset: (page - 1) * limit };
};

const paginationResponse = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || null;

const toSafeEntityId = (id) => (UUID_PATTERN.test(String(id)) ? id : null);

const writeAuditLog = async (req, { action, entityType, entityId, metadata }) => {
  try {
    await AuditLog.create({
      actor_id: req.user?.id || req.user?.userId || null,
      action,
      entity_type: entityType,
      entity_id: toSafeEntityId(entityId),
      metadata,
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"] || null,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error.message);
  }
};

const toUserRow = (user) => ({
  id: user.id,
  email: user.email,
  phone: user.phone,
  full_name: user.full_name,
  avatar_url: user.avatar_url,
  role_id: user.role_id,
  role: user.role?.name || null,
  is_active: user.is_active,
  email_verified: user.email_verified,
  phone_verified: user.phone_verified,
  approval_status: user.approval_status,
  approved_by: user.approved_by,
  approved_at: user.approved_at,
  approval_note: user.approval_note,
  last_login: user.last_login,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const getRoleFilter = async (roleName) => {
  if (!roleName) return {};
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) return null;
  return { role_id: role.id };
};

const BROADCAST_TARGETS = {
  all: null,
  teacher: ["teacher", "lecturer", "giang_vien", "faculty"],
  student: ["student", "sinh_vien"],
};

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

export const getAdminDashboard = async (_req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      activeCourses,
      pendingAIJobs,
      runningAIJobs,
      failedAIJobs,
      queuedJobs,
      failedQueueJobs,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { is_active: true } }),
      Course.count(),
      Course.count({ where: { is_active: true } }),
      AIJob.count({ where: { status: "PENDING" } }),
      AIJob.count({ where: { status: "RUNNING" } }),
      AIJob.count({ where: { status: "FAILED" } }),
      QueueJob.count({ where: { status: "queued" } }),
      QueueJob.count({ where: { status: "failed" } }),
    ]);

    return res.json({
      users: { total: totalUsers, active: activeUsers },
      courses: { total: totalCourses, active: activeCourses },
      ai_jobs: { pending: pendingAIJobs, running: runningAIJobs, failed: failedAIJobs },
      queue_jobs: { queued: queuedJobs, failed: failedQueueJobs },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard", error: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = String(req.query.search || "").trim();
    const roleName = String(req.query.role || "").trim().toLowerCase();
    const status = String(req.query.status || "").trim().toLowerCase();
    const isActive = parseBooleanFilter(req.query.is_active);

    const where = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { full_name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) where.approval_status = status;
    if (isActive !== undefined) where.is_active = isActive;

    const roleFilter = await getRoleFilter(roleName);
    if (roleFilter === null) {
      return res.json({ users: [], pagination: paginationResponse({ page, limit, total: 0 }) });
    }
    Object.assign(where, roleFilter);

    const result = await User.findAndCountAll({
      where,
      include: [{ model: Role, as: "role", attributes: ["id", "name", "description"] }],
      attributes: { exclude: ["password_hash"] },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      users: result.rows.map(toUserRow),
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

export const getAdminUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: "role", attributes: ["id", "name", "description"] }],
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: toUserRow(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

export const updateAdminUserStatus = async (req, res) => {
  try {
    const { is_active, approval_status, approval_note } = req.body;
    const updates = {};

    if (typeof is_active === "boolean") updates.is_active = is_active;
    if (typeof approval_status === "string") {
      updates.approval_status = approval_status.trim().toLowerCase();
      updates.approved_by = req.user?.id || req.user?.userId || null;
      updates.approved_at = new Date();
    }
    if (approval_note !== undefined) updates.approval_note = approval_note;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid status fields provided" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update(updates);
    await writeAuditLog(req, {
      action: "admin.user.update_status",
      entityType: "user",
      entityId: user.id,
      metadata: updates,
    });

    const reloaded = await User.findByPk(user.id, {
      include: [{ model: Role, as: "role", attributes: ["id", "name", "description"] }],
      attributes: { exclude: ["password_hash"] },
    });

    return res.json({ message: "User status updated", user: toUserRow(reloaded) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

export const updateAdminUserRole = async (req, res) => {
  try {
    const roleId = req.body.role_id;
    const roleName = String(req.body.role || "").trim().toLowerCase();

    const role = roleId
      ? await Role.findByPk(roleId)
      : await Role.findOne({ where: { name: roleName } });

    if (!role) return res.status(404).json({ message: "Role not found" });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const previousRoleId = user.role_id;
    await user.update({ role_id: role.id });
    await writeAuditLog(req, {
      action: "admin.user.update_role",
      entityType: "user",
      entityId: user.id,
      metadata: { previous_role_id: previousRoleId, new_role_id: role.id, new_role: role.name },
    });

    const reloaded = await User.findByPk(user.id, {
      include: [{ model: Role, as: "role", attributes: ["id", "name", "description"] }],
      attributes: { exclude: ["password_hash"] },
    });

    return res.json({ message: "User role updated", user: toUserRow(reloaded) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user role", error: error.message });
  }
};

export const getAdminRoles = async (_req, res) => {
  try {
    const roles = await Role.findAll({ order: [["id", "ASC"]] });
    return res.json({ roles });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch roles", error: error.message });
  }
};

export const getAdminCourses = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = String(req.query.search || "").trim();
    const isActive = parseBooleanFilter(req.query.is_active);
    const facultyId = req.query.faculty_id ? Number.parseInt(req.query.faculty_id, 10) : undefined;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (isActive !== undefined) where.is_active = isActive;
    if (Number.isInteger(facultyId)) where.faculty_id = facultyId;

    const result = await Course.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      courses: result.rows,
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
};

export const getAdminCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json({ course });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch course", error: error.message });
  }
};

export const updateAdminCourseStatus = async (req, res) => {
  try {
    if (typeof req.body.is_active !== "boolean") {
      return res.status(400).json({ message: "is_active must be boolean" });
    }

    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await course.update({ is_active: req.body.is_active });
    await writeAuditLog(req, {
      action: "admin.course.update_status",
      entityType: "course",
      entityId: null,
      metadata: { course_id: course.id, is_active: req.body.is_active },
    });

    return res.json({ message: "Course status updated", course });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update course status", error: error.message });
  }
};

export const updateAdminCourseTeachers = async (_req, res) =>
  res.status(501).json({
    message: "Course teacher assignment requires a course_teachers table or equivalent relation.",
  });

export const getAdminAIJobs = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const status = String(req.query.status || "").trim().toUpperCase();
    const traceId = String(req.query.trace_id || "").trim();
    const where = {};

    if (status) where.status = status;
    if (traceId) where.trace_id = traceId;

    const result = await AIJob.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      ai_jobs: result.rows,
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch AI jobs", error: error.message });
  }
};

export const getAdminAIJobById = async (req, res) => {
  try {
    const aiJob = await AIJob.findByPk(req.params.id);
    if (!aiJob) return res.status(404).json({ message: "AI job not found" });
    return res.json({ ai_job: aiJob });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch AI job", error: error.message });
  }
};

export const getAdminQueueJobs = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const status = String(req.query.status || "").trim().toLowerCase();
    const queueName = String(req.query.queue_name || "").trim();
    const jobType = String(req.query.job_type || "").trim();
    const traceId = String(req.query.trace_id || "").trim();
    const where = {};

    if (status) where.status = status;
    if (queueName) where.queue_name = queueName;
    if (jobType) where.job_type = jobType;
    if (traceId) where.trace_id = traceId;

    const result = await QueueJob.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      queue_jobs: result.rows,
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch queue jobs", error: error.message });
  }
};

export const getAdminQueueJobById = async (req, res) => {
  try {
    const queueJob = await QueueJob.findByPk(req.params.id);
    if (!queueJob) return res.status(404).json({ message: "Queue job not found" });
    return res.json({ queue_job: queueJob });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch queue job", error: error.message });
  }
};

export const getAdminAuditLogs = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const action = String(req.query.action || "").trim();
    const entityType = String(req.query.entity_type || "").trim();
    const actorId = String(req.query.actor_id || "").trim();
    const where = {};

    if (action) where.action = { [Op.iLike]: `%${action}%` };
    if (entityType) where.entity_type = entityType;
    if (actorId) where.actor_id = actorId;

    const result = await AuditLog.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      audit_logs: result.rows,
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch audit logs", error: error.message });
  }
};

export const getAdminSystemLogs = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const eventType = String(req.query.event_type || "").trim();
    const source = String(req.query.source || "").trim();
    const status = String(req.query.status || "").trim();
    const traceId = String(req.query.trace_id || "").trim();
    const where = {};

    if (eventType) where.event_type = { [Op.iLike]: `%${eventType}%` };
    if (source) where.source = source;
    if (status) where.status = status;
    if (traceId) where.trace_id = traceId;

    const result = await SystemEvent.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      system_logs: result.rows,
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch system logs", error: error.message });
  }
};

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
