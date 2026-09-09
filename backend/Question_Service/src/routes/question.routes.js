/**
 * Question Routes - API endpoints cho Question Module
 * Mount: /api/questions/*
 */
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as questionController from "../controllers/question.controller.js";

const router = express.Router();
router.use(authenticate);

// CRUD
router.get("/", questionController.getQuestions);
router.get("/:id", questionController.getQuestionById);
router.post("/", questionController.createQuestion);
router.patch("/:id", questionController.updateQuestion);
router.delete("/:id", questionController.deleteQuestion);

// Version Control
router.get("/:id/versions", questionController.getQuestionVersions);
router.get("/:id/versions/:versionId/diff", questionController.getVersionDiff);
router.post("/:id/versions/:versionId/restore", questionController.restoreQuestionVersion);

export default router;
