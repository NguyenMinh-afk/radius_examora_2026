import express from "express";
import {
  googleCallback,
  googleLogin,
  googleLoginCredential,
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller.js";
import { completeProfile, getProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLoginCredential);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", me);
router.get("/profile", getProfile);
router.post("/profile", completeProfile);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

export default router;
