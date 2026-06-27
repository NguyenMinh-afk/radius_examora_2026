/**
 * Teacher Routes - API endpoints cho Teacher Module (Exam_Service)
 * Mount: /api/teacher/*
 * Tất cả routes yêu cầu authenticate + requireTeacher
 */
import express from "express";
import { authenticate, requireTeacher } from "../middleware/auth.middleware.js";
import {
  getDashboard,
  getCourses,
  getClasses,
  getClassDetail,
  getAssignments,
  getSchedule,
  getClassPosts,
  createClassPost,
  updateClassPost,
  deleteClassPost,
  getResults,
  getProfile,
  updateProfile,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseDetail,
  createClass,
  updateClass,
  deleteClass,
  getExams,
  getExamDetail,
  createExam,
  updateExam,
  deleteExam,
  getExamQuestions,
  addExamQuestions,
  updateExamQuestion,
  removeExamQuestion,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(requireTeacher);

/**
 * GET /api/teacher/dashboard
 * Dashboard tổng quan cho giáo viên
 */
router.get("/dashboard", getDashboard);

/**
 * GET /api/teacher/classes
 * Danh sách lớp học của giáo viên
 */
router.get("/classes", getClasses);

/**
 * GET /api/teacher/classes/:classId
 * Chi tiết một lớp học
 */
router.get("/classes/:classId", getClassDetail);

/**
 * GET /api/teacher/classes/:classId/posts
 * Lấy danh sách thông báo của lớp
 * Query: type, search, page, limit
 */
router.get("/classes/:classId/posts", getClassPosts);

/**
 * POST /api/teacher/classes/:classId/posts
 * Tạo thông báo mới cho lớp
 * Body: { title, content, type, isPinned, attachments }
 */
router.post("/classes/:classId/posts", createClassPost);

/**
 * PUT /api/teacher/posts/:postId
 * Cập nhật thông báo
 */
router.put("/posts/:postId", updateClassPost);

/**
 * DELETE /api/teacher/posts/:postId
 * Xóa thông báo
 */
router.delete("/posts/:postId", deleteClassPost);

/**
 * GET /api/teacher/assignments
 * Danh sách bài đã giao
 * Query: status, classId, search
 */
router.get("/assignments", getAssignments);

/**
 * GET /api/teacher/assignments/schedule
 * Lịch thi theo tháng
 * Query: year, month
 */
router.get("/assignments/schedule", getSchedule);

/**
 * GET /api/teacher/results
 * Kết quả bài thi của sinh viên
 * Query: classId, assignmentId, status
 */
router.get("/results", getResults);

/**
 * GET /api/teacher/profile
 * Thông tin profile của giáo viên đang đăng nhập
 */
router.get("/profile", getProfile);

/**
 * PUT /api/teacher/profile
 * Cập nhật profile của giáo viên
 */
router.put("/profile", updateProfile);

/**
 * GET /api/teacher/courses
 * Danh sách khóa học
 */
router.get("/courses", getCourses);

/**
 * POST /api/teacher/courses
 * Tạo khóa học mới
 */
router.post("/courses", createCourse);

/**
 * GET /api/teacher/courses/:courseId
 * Chi tiết khóa học
 */
router.get("/courses/:courseId", getCourseDetail);

/**
 * PUT /api/teacher/courses/:courseId
 * Cập nhật khóa học
 */
router.put("/courses/:courseId", updateCourse);

/**
 * DELETE /api/teacher/courses/:courseId
 * Xóa khóa học
 */
router.delete("/courses/:courseId", deleteCourse);

/**
 * POST /api/teacher/classes
 * Tạo lớp học mới
 */
router.post("/classes", createClass);

/**
 * PUT /api/teacher/classes/:classId
 * Cập nhật lớp học
 */
router.put("/classes/:classId", updateClass);

/**
 * DELETE /api/teacher/classes/:classId
 * Xóa lớp học
 */
router.delete("/classes/:classId", deleteClass);

/**
 * GET /api/teacher/exams
 * Danh sách đề thi
 */
router.get("/exams", getExams);

/**
 * POST /api/teacher/exams
 * Tạo đề thi mới
 */
router.post("/exams", createExam);

/**
 * GET /api/teacher/exams/:examId
 * Chi tiết đề thi
 */
router.get("/exams/:examId", getExamDetail);

/**
 * PUT /api/teacher/exams/:examId
 * Cập nhật đề thi
 */
router.put("/exams/:examId", updateExam);

/**
 * DELETE /api/teacher/exams/:examId
 * Xóa đề thi
 */
router.delete("/exams/:examId", deleteExam);

/**
 * GET /api/teacher/exams/:examId/questions
 * Lấy danh sách câu hỏi trong đề thi
 */
router.get("/exams/:examId/questions", getExamQuestions);

/**
 * POST /api/teacher/exams/:examId/questions
 * Thêm câu hỏi vào đề thi
 * Body: { questionIds: [...], defaultPoints: 1.0 }
 */
router.post("/exams/:examId/questions", addExamQuestions);

/**
 * PUT /api/teacher/exams/:examId/questions/:questionId
 * Cập nhật thứ tự/điểm câu hỏi trong đề
 * Body: { order, points }
 */
router.put("/exams/:examId/questions/:questionId", updateExamQuestion);

/**
 * DELETE /api/teacher/exams/:examId/questions/:questionId
 * Xóa câu hỏi khỏi đề thi
 */
router.delete("/exams/:examId/questions/:questionId", removeExamQuestion);

export default router;
