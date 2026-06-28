/**
 * Admin User Controller
 */
import { Op } from "../../models/index.js";
import { getPagination, paginationResponse, parseBooleanFilter, toUserRow, writeAuditLog } from "./admin.shared.js";

const getRoleFilter = async (roleName) => {
  if (!roleName) return {};
  const { Role } = await import("../../models/index.js");
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) return null;
  return { role_id: role.id };
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

    const { User, Role } = await import("../../models/index.js");
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
    const { User, Role } = await import("../../models/index.js");
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

    const { User, Role } = await import("../../models/index.js");
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
    const { Role, User } = await import("../../models/index.js");
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
    const { Role } = await import("../../models/index.js");
    const roles = await Role.findAll({ order: [["id", "ASC"]] });
    return res.json({ roles });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch roles", error: error.message });
  }
};
