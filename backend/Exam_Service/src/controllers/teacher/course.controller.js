/**
 * Teacher Course Controller
 */
import { courseService } from "../../services/teacher/index.js";

export const getCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await courseService.getCourses(teacherId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getCourses error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getCourseDetail = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const data = await courseService.getCourseDetail(teacherId, courseId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getCourseDetail error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};

export const createCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await courseService.createCourse(teacherId, req.body);
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
    const data = await courseService.updateCourse(teacherId, courseId, req.body);
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
    const data = await courseService.deleteCourse(teacherId, courseId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] deleteCourse error:", error);
    const status = error.message?.includes("không tìm thấy") ? 404 : 400;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};
