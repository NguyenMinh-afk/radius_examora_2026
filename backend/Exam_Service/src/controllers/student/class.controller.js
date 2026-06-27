/**
 * Student Class Controller
 */
import { classService } from "../../services/student/index.js";

export const getClasses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const classes = await classService.getClasses(studentId);
    return res.json(classes);
  } catch (error) {
    console.error("[Student] getClasses error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const getClassDetail = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId } = req.params;
    const classDetail = await classService.getClassDetail(studentId, classId);
    return res.json(classDetail);
  } catch (error) {
    console.error("[Student] getClassDetail error:", error);
    const status = error.message?.includes("not a member") ? 403 : 404;
    return res.status(status).json({
      error: error.message || "Class not found or access denied",
    });
  }
};
