/**
 * Teacher Class Controller
 */
import { classService } from "../../services/teacher/index.js";

export const getClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await classService.getClasses(teacherId);
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
    const data = await classService.getClassDetail(teacherId, classId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getClassDetail error:", error);
    const status = error.message?.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const createClass = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await classService.createClass(teacherId, req.body);
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
    const data = await classService.updateClass(teacherId, classId, req.body);
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
    const data = await classService.deleteClass(teacherId, classId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] deleteClass error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 400;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};
