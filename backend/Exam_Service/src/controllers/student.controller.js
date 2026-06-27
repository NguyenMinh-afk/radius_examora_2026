/**
 * Student Controller - HTTP layer cho Student Module
 * - Nhận req, gọi service, trả response
 * - KHÔNG chứa business logic
 * - KHÔNG chứa auth/profile/settings (nằm ở User_Service)
 */
import studentService from "../services/student.service.js";

export const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const data = await studentService.getDashboard(studentId);
    return res.json(data);
  } catch (error) {
    console.error("[Student] getDashboard error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const getClasses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const classes = await studentService.getClasses(studentId);
    return res.json(classes);
  } catch (error) {
    console.error("[Student] getClasses error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const getClassDetail = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId } = req.params;
    const classDetail = await studentService.getClassDetail(studentId, classId);
    return res.json(classDetail);
  } catch (error) {
    console.error("[Student] getClassDetail error:", error);
    const status = error.message?.includes("not a member") ? 403 : 404;
    return res.status(status).json({
      error: error.message || "Class not found or access denied",
    });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, search, classId } = req.query;
    const data = await studentService.getAssignments(studentId, {
      status,
      search,
      classId,
    });
    return res.json(data);
  } catch (error) {
    console.error("[Student] getAssignments error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const getResults = async (req, res) => {
  try {
    const studentId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await studentService.getResults(studentId, limit);
    return res.json(data);
  } catch (error) {
    console.error("[Student] getResults error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const getClassPosts = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId } = req.params;
    const { type, search, page, limit } = req.query;
    const data = await studentService.getClassPosts(studentId, classId, { type, search, page, limit });
    return res.json(data);
  } catch (error) {
    console.error("[Student] getClassPosts error:", error);
    const status = error.message?.includes("not a member") ? 403 : 404;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};
