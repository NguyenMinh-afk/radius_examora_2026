/**
 * Profile Controller - HTTP layer cho Profile Module
 * ESM - Nhận req, gọi service, trả response
 * KHÔNG chứa auth/exam/question/notification business logic
 */
import bcrypt from "bcrypt";
import {
  User,
  UserProfile,
  StudentProfile,
  TeacherProfile,
  Role,
} from "../models/index.js";
import profileService from "../services/profile.service.js";

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await profileService.getProfile(userId);
    return res.json(profile);
  } catch (error) {
    console.error("[Profile] getMyProfile error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, avatarUrl, dateOfBirth, gender, schoolName } = req.body;

    const updated = await profileService.updateProfile(userId, {
      fullName,
      phone,
      avatarUrl,
      dateOfBirth,
      gender,
      schoolName,
    });

    return res.json(updated);
  } catch (error) {
    console.error("[Profile] updateMyProfile error:", error);
    const status = error.message?.includes("not found") ? 404 : 500;
    return res.status(status).json({
      error: error.message || "Internal server error",
    });
  }
};

export const updateMySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailNotifications, theme, language, timezone } = req.body;

    const updated = await profileService.updateSettings(userId, {
      emailNotifications,
      theme,
      language,
      timezone,
    });

    return res.json(updated);
  } catch (error) {
    console.error("[Profile] updateMySettings error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "currentPassword and newPassword are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });
    }

    const result = await profileService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("[Profile] changePassword error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
