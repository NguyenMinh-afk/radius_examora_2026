/**
 * Profile Routes - API endpoints cho Profile/Settings Module
 * Mount: /api/profile/*
 * ESM - Profile/settings thuộc User_Service
 */
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getMyProfile,
  updateMyProfile,
  updateMySettings,
  changePassword
} from "../controllers/profile.controller.js";

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/profile/me
 * Lấy thông tin profile hiện tại
 */
router.get("/me", getMyProfile);

/**
 * PATCH /api/profile/me
 * Cập nhật thông tin profile
 */
router.patch("/me", updateMyProfile);

/**
 * PATCH /api/profile/settings
 * Cập nhật settings của user
 */
router.patch("/settings", updateMySettings);

/**
 * PATCH /api/profile/change-password
 * Đổi mật khẩu
 */
router.patch("/change-password", changePassword);

export default router;
