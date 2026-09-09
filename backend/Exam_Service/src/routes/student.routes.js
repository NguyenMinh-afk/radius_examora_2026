/**
 * Student Routes - API endpoints cho Student Module (Exam_Service)
 * - Mount: /api/student/*
 * - Tất cả routes yêu cầu authenticate + requireStudent
 * - KHÔNG có auth/profile/settings/notification ở đây
 */
import express from "express";
import {
  authenticate,
  requireStudent,
} from "../middleware/auth.middleware.js";
import {
  getDashboard,
  getClasses,
  getClassDetail,
  joinClass,
  getAssignments,
  startAssignment,
  getAssignmentQuestions,
  submitAssignment,
  getResults,
  getClassPosts,
  getProfile,
  updateProfile,
  getNotificationSettings,
  updateNotificationSettings,
  changePassword,
} from "../controllers/student/index.js";

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/student/dashboard
 * Lấy dashboard tổng quan cho học sinh
 */
router.get("/dashboard", requireStudent, getDashboard);

/**
 * GET /api/student/profile
 * Lấy thông tin profile học sinh
 */
router.get("/profile", requireStudent, getProfile);

/**
 * PUT /api/student/profile
 * Cập nhật thông tin profile học sinh
 */
router.put("/profile", requireStudent, updateProfile);

/**
 * GET /api/student/classes
 * Lấy danh sách lớp học của học sinh
 */
router.get("/classes", requireStudent, getClasses);

/**
 * GET /api/student/classes/:classId
 * Chi tiết một lớp học
 */
router.get("/classes/:classId", requireStudent, getClassDetail);

/**
 * POST /api/student/classes/join
 * Tham gia lớp học bằng mã lớp
 * Body: { classCode: string }
 */
router.post("/classes/join", requireStudent, joinClass);

/**
 * GET /api/student/classes/:classId/posts
 * Lấy danh sách thông báo của lớp (học sinh)
 * Query: type, search, page, limit
 */
router.get("/classes/:classId/posts", requireStudent, getClassPosts);

/**
 * GET /api/student/assignments
 * Lấy danh sách bài thi của học sinh
 * Query: status, search, classId
 */
router.get("/assignments", requireStudent, getAssignments);

router.get("/assignments/:assignmentId/questions", requireStudent, getAssignmentQuestions);
router.post("/assignments/:assignmentId/start", requireStudent, startAssignment);
router.post("/assignments/:assignmentId/attempts/:attemptId/submit", requireStudent, submitAssignment);

/**
 * GET /api/student/results
 * Lấy kết quả các bài đã làm
 * Query: limit (default 20)
 */
router.get("/results", requireStudent, getResults);

/**
 * GET /api/student/settings/notifications
 * Lấy cài đặt thông báo
 */
router.get("/settings/notifications", requireStudent, getNotificationSettings);

/**
 * PUT /api/student/settings/notifications
 * Cập nhật cài đặt thông báo
 */
router.put("/settings/notifications", requireStudent, updateNotificationSettings);

/**
 * POST /api/student/settings/change-password
 * Đổi mật khẩu
 */
router.post("/settings/change-password", requireStudent, changePassword);

export default router;
