/**
 * Admin Question Controller
 */
import { Op } from "../../models/index.js";
import { getPagination, paginationResponse, parseBooleanFilter, toQuestionRow, writeAuditLog } from "./admin.shared.js";

export const getAdminQuestions = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = String(req.query.search || "").trim();
    const difficulty = String(req.query.difficulty || "").trim().toLowerCase();
    const source = String(req.query.source || "").trim().toLowerCase();
    const isActive = parseBooleanFilter(req.query.is_active);
    const courseId = req.query.course_id ? Number.parseInt(req.query.course_id, 10) : undefined;

    const where = {};

    if (search) {
      where[Op.or] = [
        { content: { [Op.iLike]: `%${search}%` } },
        { correct_answer: { [Op.iLike]: `%${search}%` } },
        { explanation: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (difficulty) where.difficulty = difficulty;
    if (isActive !== undefined) where.is_active = isActive;
    if (Number.isInteger(courseId)) where.course_id = courseId;
    if (source === "ai") where.is_ai_generated = true;
    if (source === "manual") where.is_ai_generated = false;

    const { Question, Course, User } = await import("../../models/index.js");
    const result = await Question.findAndCountAll({
      where,
      include: [
        { model: Course, as: "course", attributes: ["id", "name", "code"] },
        { model: User, as: "creator", attributes: ["id", "email", "full_name"] },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      questions: result.rows.map(toQuestionRow),
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch questions", error: error.message });
  }
};

export const getAdminQuestionById = async (req, res) => {
  try {
    const { Question, Course, User } = await import("../../models/index.js");
    const question = await Question.findByPk(req.params.id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "name", "code"] },
        { model: User, as: "creator", attributes: ["id", "email", "full_name"] },
      ],
    });

    if (!question) return res.status(404).json({ message: "Question not found" });
    return res.json({ question: toQuestionRow(question) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch question", error: error.message });
  }
};

export const updateAdminQuestionStatus = async (req, res) => {
  try {
    if (typeof req.body.is_active !== "boolean") {
      return res.status(400).json({ message: "is_active must be boolean" });
    }

    const { Question, Course, User } = await import("../../models/index.js");
    const question = await Question.findByPk(req.params.id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "name", "code"] },
        { model: User, as: "creator", attributes: ["id", "email", "full_name"] },
      ],
    });
    if (!question) return res.status(404).json({ message: "Question not found" });

    await question.update({ is_active: req.body.is_active });
    await writeAuditLog(req, {
      action: "admin.question.update_status",
      entityType: "question",
      entityId: question.id,
      metadata: {
        question_id: question.id,
        course_id: question.course_id,
        is_active: req.body.is_active,
      },
    });

    await question.reload({
      include: [
        { model: Course, as: "course", attributes: ["id", "name", "code"] },
        { model: User, as: "creator", attributes: ["id", "email", "full_name"] },
      ],
    });

    return res.json({ message: "Question status updated", question: toQuestionRow(question) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update question status", error: error.message });
  }
};
