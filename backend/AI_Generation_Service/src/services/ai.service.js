/**
 * AI Service - Business logic cho AI Generation
 */
import { v4 as uuidv4 } from "uuid";
import { AIGenerationRequest, AIGenerationLog } from "../models/index.js";
import { publishAIGeneration } from "../config/rabbitmq.js";

class AIService {

  /**
   * Tạo yêu cầu generation - gửi vào queue để xử lý async
   */
  async createGenerationRequest(userId, data) {
    const { subjectId, chapterId, questionCount, difficulty, prompt } = data;
    const traceId = uuidv4();

    // Tạo request record với status pending
    const request = await AIGenerationRequest.create({
      user_id: userId,
      subject_id: subjectId || null,
      chapter_id: chapterId || null,
      question_count: questionCount || 10,
      difficulty: difficulty || "medium",
      prompt: prompt || null,
      status: "pending",
    });

    // Publish vào RabbitMQ queue để xử lý async
    try {
      await publishAIGeneration({
        requestId: request.id,
        userId,
        subjectId,
        chapterId,
        questionCount: questionCount || 10,
        difficulty: difficulty || "medium",
        prompt,
        traceId,
      });
    } catch (error) {
      console.error("[AIService] Failed to publish to queue:", error.message);
      // Vẫn trả về thành công, request đã được tạo trong DB
      // Worker sẽ xử lý sau khi RabbitMQ được kết nối
    }

    return {
      requestId: request.id,
      status: request.status,
      message: "AI generation request queued for processing",
      traceId,
    };
  }

  /**
   * Lấy trạng thái request
   */
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
      completedAt: request.completed_at,
    };
  }

  /**
   * Lấy danh sách requests của user
   */
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

  /**
   * Cập nhật trạng thái request (gọi từ worker)
   */
  async updateRequestStatus(requestId, status, result = null, error = null) {
    const updateData = { status };
    if (result) updateData.result = result;
    if (error) updateData.error = error;
    if (status === "completed" || status === "failed") {
      updateData.completed_at = new Date();
    }

    await AIGenerationRequest.update(updateData, {
      where: { id: requestId },
    });
  }
}

export default new AIService();
