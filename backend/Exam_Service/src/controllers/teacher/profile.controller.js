/**
 * Teacher Profile Controller
 */
import { profileService } from "../../services/teacher/index.js";

export const getProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await profileService.getProfile(teacherId);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] getProfile error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = await profileService.updateProfile(teacherId, req.body);
    return res.json(data);
  } catch (error) {
    console.error("[Teacher] updateProfile error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};