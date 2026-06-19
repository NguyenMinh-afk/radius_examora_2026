import express from "express";

import {
  getAdminAIJobById,
  getAdminAIJobs,
  getAdminAuditLogs,
  getAdminCourseById,
  getAdminCourses,
  getAdminDashboard,
  getAdminQueueJobById,
  getAdminQueueJobs,
  getAdminRoles,
  getAdminSystemLogs,
  getAdminUserById,
  getAdminUsers,
  updateAdminCourseStatus,
  updateAdminCourseTeachers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

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

router.get("/ai-jobs", getAdminAIJobs);
router.get("/ai-jobs/:id", getAdminAIJobById);

router.get("/queue-jobs", getAdminQueueJobs);
router.get("/queue-jobs/:id", getAdminQueueJobById);

router.get("/audit-logs", getAdminAuditLogs);
router.get("/system-logs", getAdminSystemLogs);

export default router;
