/**
 * Teacher Question Controller
 */
import { questionService } from "../../services/teacher/index.js";

export const getExamQuestions = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { examId } = req.params;
    const data = await questionService.getExamQuestions(teacherId, examId);
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
    const data = await questionService.addExamQuestions(teacherId, examId, { questionIds, defaultPoints });
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
    const data = await questionService.updateExamQuestion(teacherId, examId, questionId, req.body);
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
    const data = await questionService.removeExamQuestion(teacherId, examId, questionId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] removeExamQuestion error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};
