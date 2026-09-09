/**
 * Teacher Result Controller
 */
import { resultService } from "../../services/teacher/index.js";

export const getResults = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId, assignmentId, status } = req.query;
    const data = await resultService.getResults(teacherId, { classId, assignmentId, status });
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getResults error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
