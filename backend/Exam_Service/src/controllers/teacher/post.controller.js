/**
 * Teacher Post Controller
 */
import { postService } from "../../services/teacher/index.js";

export const getClassPosts = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.params;
    const { type, search, page, limit } = req.query;
    const data = await postService.getClassPosts(teacherId, classId, { type, search, page, limit });
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
    const data = await postService.createClassPost(teacherId, classId, req.body);
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
    const data = await postService.updateClassPost(teacherId, postId, req.body);
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
    const data = await postService.deleteClassPost(teacherId, postId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] deleteClassPost error:", error);
    const status = error.message?.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};
