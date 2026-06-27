/**
 * Teacher Assignment Controller
 */
import { assignmentService } from "../../services/teacher/index.js";

export const getAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { status, classId, search } = req.query;
    const data = await assignmentService.getAssignments(teacherId, { status, classId, search });
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getAssignments error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getSchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { year, month } = req.query;
    const data = await assignmentService.getSchedule(teacherId, parseInt(year), parseInt(month));
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getSchedule error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
