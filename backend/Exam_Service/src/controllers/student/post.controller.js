/**
 * Student Post Controller
 */
import { postService } from "../../services/student/index.js";

export const getClassPosts = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId } = req.params;
    const { type, search, page, limit } = req.query;
    const data = await postService.getClassPosts(studentId, classId, { type, search, page, limit });
    return res.json(data);
  } catch (error) {
    console.error("[Student] getClassPosts error:", error);
    const status = error.message?.includes("not a member") ? 403 : 404;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};
