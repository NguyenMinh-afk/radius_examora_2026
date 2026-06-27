/**
 * Student Result Controller
 */
import { resultService } from "../../services/student/index.js";

export const getResults = async (req, res) => {
  try {
    const studentId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await resultService.getResults(studentId, limit);
    return res.json(data);
  } catch (error) {
    console.error("[Student] getResults error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
