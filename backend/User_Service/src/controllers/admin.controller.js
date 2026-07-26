/**
 * Admin Controller - Re-exports từ các module con
 * Chứa các API endpoints cho admin dashboard và quản lý
 */

// Dashboard
export { getAdminDashboard } from "./admin/admin.dashboard.controller.js";

// Users
export { getAdminUsers, getAdminUserById, updateAdminUserStatus, updateAdminUserRole, updateAdminUser, deleteAdminUser, getAdminRoles } from "./admin/admin.user.controller.js";

// Courses
export { getAdminCourses, getAdminCourseById, updateAdminCourseStatus, updateAdminCourseTeachers } from "./admin/admin.course.controller.js";

// Questions
export { getAdminQuestions, getAdminQuestionById, updateAdminQuestionStatus } from "./admin/admin.question.controller.js";

// AI Jobs
export { getAdminAIJobs, getAdminAIJobById } from "./admin/admin.ai-job.controller.js";

// Queue Jobs
export { getAdminQueueJobs, getAdminQueueJobById } from "./admin/admin.queue-job.controller.js";

// Logs
export { getAdminAuditLogs, getAdminSystemLogs } from "./admin/admin.log.controller.js";

// Notifications
export { getAdminNotifications, createAdminNotification } from "./admin/admin.notification.controller.js";

// Helpers - export để các module con có thể dùng
export { toUserRow, toQuestionRow, toNotificationRow, writeAuditLog } from "./admin/admin.shared.js";
