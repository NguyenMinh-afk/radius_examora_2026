/**
 * AI Generation Queue Consumer
 * Xử lý việc tạo câu hỏi bất đồng bộ qua RabbitMQ
 */
import axios from "axios";
import { getChannel, QUEUES } from "../config/rabbitmq.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3003";

/**
 * Xử lý message tạo câu hỏi AI
 */
async function processAIGenerationMessage(msg) {
  const content = JSON.parse(msg.content.toString());
  
  const { requestId, userId, subjectId, chapterId, questionCount, difficulty, prompt, traceId } = content;
  
  if (!requestId || !userId) {
    console.error("[AIConsumer] Missing required fields: requestId, userId");
    return false;
  }
  
  console.log(`[AIConsumer] Processing AI generation request: ${requestId} (trace: ${traceId})`);
  
  try {
    // Gọi AI Service để xử lý generation
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/process`, {
      request_id: requestId,
      user_id: userId,
      subject_id: subjectId,
      chapter_id: chapterId,
      question_count: questionCount,
      difficulty: difficulty,
      prompt: prompt,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 300000, // 5 minutes timeout for AI processing
    });
    
    console.log(`[AIConsumer] AI generation completed: ${requestId}`);
    return true;
  } catch (error) {
    console.error(`[AIConsumer] AI generation failed for ${requestId}:`, error.message);
    
    // Update request status to failed via AI Service
    try {
      await axios.patch(`${AI_SERVICE_URL}/api/ai/requests/${requestId}/status`, {
        status: "failed",
        error: error.message,
      }, {
        timeout: 5000,
      });
    } catch (updateError) {
      console.error("[AIConsumer] Failed to update request status:", updateError.message);
    }
    
    return false;
  }
}

/**
 * Khởi động AI Consumer
 */
export async function startAIConsumer() {
  const channel = getChannel();
  
  console.log("[AIConsumer] Starting AI generation consumer...");
  
  await channel.consume(QUEUES.AI_GENERATION, async (msg) => {
    if (!msg) return;
    
    try {
      const success = await processAIGenerationMessage(msg);
      
      if (success) {
        channel.ack(msg);
      } else {
        // Reject và gửi vào DLQ sau 3 lần thử
        const retryCount = (msg.properties.headers?.["x-retry-count"] || 0);
        if (retryCount < 3) {
          // Requeue với retry count tăng
          channel.nack(msg, false, true);
        } else {
          channel.nack(msg, false, false);
        }
      }
    } catch (error) {
      console.error("[AIConsumer] Error processing message:", error.message);
      channel.nack(msg, false, false);
    }
  });
  
  console.log("[AIConsumer] AI consumer started on queue:", QUEUES.AI_GENERATION);
}

export default { startAIConsumer };
