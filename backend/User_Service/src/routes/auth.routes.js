import express from "express";
import {
  googleCallback,
  googleLogin,
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", me);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

export default router;
