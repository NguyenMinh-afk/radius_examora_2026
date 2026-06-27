/**
 * Teacher Dashboard Controller
 */
import { dashboardService } from "../../services/teacher/index.js";

export const getDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await dashboardService.getDashboard(teacherId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getDashboard error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
