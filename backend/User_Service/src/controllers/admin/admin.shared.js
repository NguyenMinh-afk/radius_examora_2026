/**
 * Admin Shared - Các function dùng chung trong admin controllers
 */
import { AuditLog } from "../../models/index.js";
import { getClientIp, toSafeEntityId, getPagination, paginationResponse, parseBooleanFilter } from "./admin.helpers.js";

export { getPagination, paginationResponse, parseBooleanFilter };

export const toUserRow = (user) => ({
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

export const toQuestionRow = (question) => ({
  id: question.id,
  course_id: question.course_id,
  course_name: question.course?.name || null,
  course_code: question.course?.code || null,
  created_by: question.created_by,
  creator_name: question.creator?.full_name || null,
  creator_email: question.creator?.email || null,
  question_type: question.question_type,
  difficulty: question.difficulty,
  content: question.content,
  options: question.options,
  correct_answer: question.correct_answer,
  explanation: question.explanation,
  points: question.points,
  time_limit: question.time_limit,
  keywords: question.keywords,
  is_ai_generated: question.is_ai_generated,
  ai_model: question.ai_model,
  is_active: question.is_active,
  is_public: question.is_public,
  created_at: question.created_at,
  updated_at: question.updated_at,
});

export const toNotificationRow = (notification) => ({
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

export const writeAuditLog = async (req, { action, entityType, entityId, metadata }) => {
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
