import express from "express";

import {
  getAdminAIJobById,
  getAdminAIJobs,
  getAdminAuditLogs,
  getAdminCourseById,
  getAdminCourses,
  getAdminDashboard,
  getAdminNotifications,
  getAdminQuestionById,
  getAdminQuestions,
  getAdminQueueJobById,
  getAdminQueueJobs,
  getAdminRoles,
  getAdminSystemLogs,
  getAdminUserById,
  getAdminUsers,
  updateAdminCourseStatus,
  updateAdminCourseTeachers,
  updateAdminQuestionStatus,
  createAdminNotification,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/dashboard", getAdminDashboard);

router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUserById);
router.patch("/users/:id/status", updateAdminUserStatus);
router.patch("/users/:id/role", updateAdminUserRole);

router.get("/roles", getAdminRoles);

router.get("/courses", getAdminCourses);
router.get("/courses/:id", getAdminCourseById);
router.patch("/courses/:id/status", updateAdminCourseStatus);
router.patch("/courses/:id/teachers", updateAdminCourseTeachers);

router.get("/questions", getAdminQuestions);
router.get("/questions/:id", getAdminQuestionById);
router.patch("/questions/:id/status", updateAdminQuestionStatus);

router.get("/ai-jobs", getAdminAIJobs);
router.get("/ai-jobs/:id", getAdminAIJobById);

router.get("/queue-jobs", getAdminQueueJobs);
router.get("/queue-jobs/:id", getAdminQueueJobById);

router.get("/audit-logs", getAdminAuditLogs);
router.get("/system-logs", getAdminSystemLogs);

router.get("/notifications", getAdminNotifications);
router.post("/notifications", createAdminNotification);

export default router;
