/**
 * AI Service - Business logic cho AI Generation
 */
import { v4 as uuidv4 } from "uuid";
import {
  AIGenerationRequest,
  AIGenerationTask,
  GeneratedQuestion,
  AIGenerationLog,
} from "../models/index.js";
import { publishAIGeneration } from "../config/rabbitmq.js";

class AIService {

  /**
   * Tạo yêu cầu generation - tạo request, task, và gửi vào queue để xử lý async
   */
  async createGenerationRequest(userId, data) {
    const {
      courseId,
      chapterId,
      knowledgeUnitId,
      questionType,
      difficulty,
      quantity,
      context,
    } = data;

    const traceId = uuidv4();

    // Create main request
    const request = await AIGenerationRequest.create({
      user_id: userId,
      course_id: courseId || null,
      chapter_id: chapterId || null,
      knowledge_unit_id: knowledgeUnitId || null,
      question_type: questionType || null,
      difficulty: difficulty || null,
      quantity: quantity || 10,
      context: context || null,
      status: "pending",
      progress: 0,
      trace_id: traceId,
    });

    // Create task for the request
    const task = await AIGenerationTask.create({
      request_id: request.id,
      subject_id: courseId || 1, // Default subject
      topic: null,
      input_type: "text",
      input_reference: context ? context.substring(0, 500) : null,
      number_of_questions: quantity || 10,
      difficulty: difficulty || "medium",
      created_by: userId,
      status: "pending",
    });

    // Publish to RabbitMQ for AI Worker to process
    try {
      await publishAIGeneration({
        requestId: request.id,
        taskId: task.id,
        traceId,
      });
      console.log("[AIService] Published message to RabbitMQ for request:", request.id);
    } catch (error) {
      console.error("[AIService] Failed to publish to queue:", error.message);
      const errorMessage = `RabbitMQ publish failed: ${error.message}`;
      try {
        await Promise.all([
          request.update({
            status: "failed",
            error_message: errorMessage,
          }),
          task.update({
            status: "failed",
            error_message: errorMessage,
          }),
        ]);
      } catch (statusError) {
        console.error(
          "[AIService] Failed to mark request/task as failed:",
          statusError.message,
        );
      }
      throw new Error("Unable to queue AI generation request. Please try again.", {
        cause: error,
      });
    }

    return {
      requestId: request.id,
      taskId: task.id,
      status: "pending",
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
      include: [
        { model: AIGenerationTask, as: "tasks" },
        { model: AIGenerationLog, as: "logs" },
      ],
    });

    if (!request) {
      throw new Error("Request not found");
    }

    return {
      id: request.id,
      status: request.status,
      progress: request.progress,
      errorMessage: request.error_message,
      createdAt: request.created_at,
      startedAt: request.started_at,
      completedAt: request.completed_at,
      traceId: request.trace_id,
      tasks: request.tasks,
      logs: request.logs,
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
        progress: r.progress,
        quantity: r.quantity,
        difficulty: r.difficulty,
        questionType: r.question_type,
        courseId: r.course_id,
        chapterId: r.chapter_id,
        createdAt: r.created_at,
        completedAt: r.completed_at,
      })),
    };
  }

  /**
   * Cập nhật trạng thái request (gọi từ worker)
   */
  async updateRequestStatus(requestId, status, result = null, error = null) {
    const updateData = {
      status,
      progress: status === "completed" ? 100 : undefined,
    };

    if (result) updateData.result = result;
    if (error) updateData.error_message = error;
    if (status === "processing") {
      updateData.started_at = new Date();
    }
    if (status === "completed" || status === "failed") {
      updateData.completed_at = new Date();
    }

    await AIGenerationRequest.update(updateData, {
      where: { id: requestId },
    });
  }

  /**
   * Tạo task con từ request (gọi từ worker khi cần chia nhỏ)
   */
  async createTask(requestId, taskData) {
    const {
      subjectId,
      topic,
      inputType,
      inputReference,
      numberOfQuestions,
      difficulty,
      createdBy,
    } = taskData;

    const task = await AIGenerationTask.create({
      request_id: requestId,
      subject_id: subjectId,
      topic,
      input_type: inputType,
      input_reference: inputReference,
      number_of_questions: numberOfQuestions,
      difficulty,
      created_by: createdBy,
      status: "pending",
    });

    return task;
  }

  /**
   * Lưu câu hỏi được generate (gọi từ worker)
   */
  async saveGeneratedQuestion(taskId, questionData) {
    const {
      questionContent,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      difficulty,
      topic,
      explanation,
    } = questionData;

    const question = await GeneratedQuestion.create({
      task_id: taskId,
      question_content: questionContent,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
      difficulty,
      topic,
      explanation,
      status: "pending_review",
    });

    return question;
  }

  /**
   * Ghi log generation
   */
  async logGeneration(logData) {
    const {
      requestId,
      questionId,
      aiModel,
      prompt,
      response,
      tokensUsed,
      cost,
      status,
      errorMessage,
      traceId,
    } = logData;

    const log = await AIGenerationLog.create({
      request_id: requestId,
      question_id: questionId,
      ai_model: aiModel,
      prompt,
      response,
      tokens_used: tokensUsed,
      cost,
      status: status || "success",
      error_message: errorMessage,
      trace_id: traceId,
    });

    return log;
  }
}

export default new AIService();
