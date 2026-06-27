/**
 * Student Assignment Controller
 */
import { assignmentService } from "../../services/student/index.js";

export const getAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, search, classId } = req.query;
    const data = await assignmentService.getAssignments(studentId, {
      status,
      search,
      classId,
    });
    return res.json(data);
  } catch (error) {
    console.error("[Student] getAssignments error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
