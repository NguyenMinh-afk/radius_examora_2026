/**
 * Teacher Exam Controller
 */
import { examService } from "../../services/teacher/index.js";

export const getExams = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { search } = req.query;
    const data = await examService.getExams(teacherId, { search });
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
    const data = await examService.getExamDetail(teacherId, examId);
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
    const data = await examService.createExam(teacherId, req.body);
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
    const data = await examService.updateExam(teacherId, examId, req.body);
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
    const data = await examService.deleteExam(teacherId, examId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] deleteExam error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 400;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};
