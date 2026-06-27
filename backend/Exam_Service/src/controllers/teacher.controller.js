/**
 * Teacher Controller - HTTP layer cho Teacher Module (Exam_Service)
 * Nhận req, gọi service, trả response
 */
import teacherService from "../services/teacher.service.js";

export const getDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await teacherService.getDashboard(teacherId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getDashboard error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await teacherService.getCourses(teacherId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getCourses error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await teacherService.getClasses(teacherId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getClasses error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getClassDetail = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.params;
    const data = await teacherService.getClassDetail(teacherId, classId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getClassDetail error:", error);
    const status = error.message?.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { status, classId, search } = req.query;
    const data = await teacherService.getAssignments(teacherId, { status, classId, search });
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getAssignments error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getSchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { year, month } = req.query;
    const data = await teacherService.getSchedule(teacherId, parseInt(year), parseInt(month));
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getSchedule error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// ============== Class Posts (Thông báo lớp học) ==============

export const getClassPosts = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.params;
    const { type, search, page, limit } = req.query;
    const data = await teacherService.getClassPosts(teacherId, classId, { type, search, page, limit });
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getClassPosts error:", error);
    const status = error.message?.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const createClassPost = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.params;
    const data = await teacherService.createClassPost(teacherId, classId, req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error("[Teacher] createClassPost error:", error);
    const status = error.message?.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const updateClassPost = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { postId } = req.params;
    const data = await teacherService.updateClassPost(teacherId, postId, req.body);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] updateClassPost error:", error);
    const status = error.message?.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const deleteClassPost = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { postId } = req.params;
    const data = await teacherService.deleteClassPost(teacherId, postId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] deleteClassPost error:", error);
    const status = error.message?.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const getResults = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId, assignmentId, status } = req.query;
    const data = await teacherService.getResults(teacherId, { classId, assignmentId, status });
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getResults error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await teacherService.getProfile(teacherId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getProfile error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await teacherService.updateProfile(teacherId, req.body);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] updateProfile error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// ============== Course CRUD ==============

export const createCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await teacherService.createCourse(teacherId, req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error("[Teacher] createCourse error:", error);
    const status = error.message?.includes("đã tồn tại") ? 400 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const data = await teacherService.updateCourse(teacherId, courseId, req.body);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] updateCourse error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const data = await teacherService.deleteCourse(teacherId, courseId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] deleteCourse error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 400;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const getCourseDetail = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const data = await teacherService.getCourseDetail(teacherId, courseId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getCourseDetail error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

// ============== Class CRUD ==============

export const createClass = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await teacherService.createClass(teacherId, req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error("[Teacher] createClass error:", error);
    const status = error.message?.includes("đã tồn tại") ? 400 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const updateClass = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.params;
    const data = await teacherService.updateClass(teacherId, classId, req.body);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] updateClass error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.params;
    const data = await teacherService.deleteClass(teacherId, classId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] deleteClass error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 400;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

// ============== Exam CRUD ==============

export const getExams = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { search } = req.query;
    const data = await teacherService.getExams(teacherId, { search });
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getExams error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getExamDetail = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { examId } = req.params;
    const data = await teacherService.getExamDetail(teacherId, examId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getExamDetail error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const createExam = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await teacherService.createExam(teacherId, req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error("[Teacher] createExam error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const updateExam = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { examId } = req.params;
    const data = await teacherService.updateExam(teacherId, examId, req.body);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] updateExam error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { examId } = req.params;
    const data = await teacherService.deleteExam(teacherId, examId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] deleteExam error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 400;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

// ============== Exam Question Management ==============

export const getExamQuestions = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { examId } = req.params;
    const data = await teacherService.getExamQuestions(teacherId, examId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getExamQuestions error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const addExamQuestions = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { examId } = req.params;
    const { questionIds, defaultPoints } = req.body;
    const data = await teacherService.addExamQuestions(teacherId, examId, { questionIds, defaultPoints });
    return res.status(201).json(data);
  } catch (error) {
    console.error("[Teacher] addExamQuestions error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const updateExamQuestion = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { examId, questionId } = req.params;
    const data = await teacherService.updateExamQuestion(teacherId, examId, questionId, req.body);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] updateExamQuestion error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const removeExamQuestion = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { examId, questionId } = req.params;
    const data = await teacherService.removeExamQuestion(teacherId, examId, questionId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] removeExamQuestion error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};
