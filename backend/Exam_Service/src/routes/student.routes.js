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
  getAssignments,
  getResults,
} from "../controllers/student.controller.js";

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/student/dashboard
 * Lấy dashboard tổng quan cho học sinh
 */
router.get("/dashboard", requireStudent, getDashboard);

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
 * GET /api/student/assignments
 * Lấy danh sách bài thi của học sinh
 * Query: status, search, classId
 */
router.get("/assignments", requireStudent, getAssignments);

/**
 * GET /api/student/results
 * Lấy kết quả các bài đã làm
 * Query: limit (default 20)
 */
router.get("/results", requireStudent, getResults);

export default router;
