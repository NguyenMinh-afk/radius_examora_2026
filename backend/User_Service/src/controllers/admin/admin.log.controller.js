/**
 * Admin Log Controller - Audit logs & System logs
 */
import { Op } from "../../models/index.js";
import { getPagination, paginationResponse } from "./admin.helpers.js";
import { AuditLog, SystemEvent } from "../../models/index.js";

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
