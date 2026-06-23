/**
 * AI Service - Business logic cho AI Generation
 */
import { AIGenerationRequest, AIGenerationLog } from "../models/index.js";

class AIService {

  async createGenerationRequest(userId, data) {
    const { subjectId, chapterId, questionCount, difficulty, prompt } = data;

    const request = await AIGenerationRequest.create({
      user_id: userId,
      subject_id: subjectId || null,
      chapter_id: chapterId || null,
      question_count: questionCount || 10,
      difficulty: difficulty || "medium",
      prompt: prompt || null,
      status: "pending",
    });

    return {
      requestId: request.id,
      status: request.status,
      message: "AI generation request queued",
    };
  }

  async getRequestStatus(requestId, userId) {
    const request = await AIGenerationRequest.findOne({
      where: { id: requestId, user_id: userId },
      include: [{ model: AIGenerationLog, as: "logs" }],
    });

    if (!request) {
      throw new Error("Request not found");
    }

    return {
      id: request.id,
      status: request.status,
      result: request.result,
      error: request.error,
      createdAt: request.created_at,
    };
  }

  async getMyRequests(userId, limit = 20) {
    const requests = await AIGenerationRequest.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit,
    });

    return {
      items: requests.map((r) => ({
        id: r.id,
        status: r.status,
        questionCount: r.question_count,
        difficulty: r.difficulty,
        createdAt: r.created_at,
      })),
    };
  }
}

export default new AIService();
