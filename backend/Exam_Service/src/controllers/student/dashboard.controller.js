/**
 * Student Dashboard Controller
 */
import { dashboardService } from "../../services/student/index.js";

export const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const data = await dashboardService.getDashboard(studentId);
    return res.json(data);
  } catch (error) {
    console.error("[Student] getDashboard error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
