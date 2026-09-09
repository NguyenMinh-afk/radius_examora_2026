/**
 * AI Routes - API endpoints cho AI Generation Module
 * Mount: /api/ai/*
 */
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import aiController from "../controllers/ai.controller.js";

const router = express.Router();
router.use(authenticate);

router.post("/generate-questions", aiController.generateQuestions);
router.get("/requests/:id", aiController.getRequestStatus);
router.get("/requests", aiController.getMyRequests);

export default router;
