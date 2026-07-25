import express from "express";
import {
  googleCallback,
  googleLogin,
  googleLoginCredential,
  googleResult,
  login,
  logout,
  me,
  refresh,
  register,
  forgotPassword,
  verifyOTP,
  verifyToken,
  doResetPassword,
} from "../controllers/auth/index.js";
import { updateMyProfile, getMyProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLoginCredential);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", me);
router.get("/profile", getMyProfile);
router.post("/profile", updateMyProfile);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/google/result", googleResult);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/verify-reset-token", verifyToken);
router.post("/reset-password", doResetPassword);

export default router;
