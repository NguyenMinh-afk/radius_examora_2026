/**
 * Student Assignment Controller
 */
import examService from "../../services/student/exam.service.js";
import assignmentService from "../../services/student/assignment.service.js";
import { publishExamCompleted } from "../../config/rabbitmq.js";

export const getAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, search, classId } = req.query;
    const data = await assignmentService.getAssignments(studentId, {
      status,
      search,
      classId,
    });
    return res.json(data);
  } catch (error) {
    console.error("[Student] getAssignments error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const startAssignment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assignmentId } = req.params;

    const result = await examService.startAttempt(studentId, assignmentId);
    return res.json(result);
  } catch (error) {
    console.error("[Student] startAssignment error:", error);
    return res.status(400).json({
      error: error.message || "Unable to start assignment",
    });
  }
};

export const getAssignmentQuestions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assignmentId } = req.params;

    const result = await examService.getAssignmentQuestions(studentId, assignmentId);
    return res.json(result);
  } catch (error) {
    console.error("[Student] getAssignmentQuestions error:", error);
    return res.status(400).json({
      error: error.message || "Unable to load questions",
    });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assignmentId } = req.params;
    const { answers } = req.body || {};

    const result = await examService.submitAttempt(studentId, assignmentId, answers || []);
    if (!result.wasAlreadySubmitted) {
      await publishExamCompleted(
        {
          attemptId: result.attempt.id,
          assignmentId,
          studentId,
          score: result.summary.score,
          percentage: result.summary.percentage,
          correctAnswers: result.summary.correctAnswers,
          wrongAnswers: result.summary.wrongAnswers,
          submittedAt: result.attempt.submitted_at,
        },
        {
          traceId: req.correlationId,
          requestId: req.requestId,
        },
      );
    }
    return res.json({
      attempt: {
        attemptId: result.attempt.id,
        score: result.attempt.score != null ? Number(result.attempt.score) : null,
        percentage: result.attempt.percentage != null ? Number(result.attempt.percentage) : null,
        correct_answers: result.attempt.correct_answers || 0,
        wrong_answers: result.attempt.wrong_answers || 0,
        submitted_at: result.attempt.submitted_at,
      },
      summary: result.summary,
    });
  } catch (error) {
    console.error("[Student] submitAssignment error:", error);
    return res.status(400).json({
      error: error.message || "Unable to submit assignment",
    });
  }
};
