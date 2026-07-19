/**
 * RabbitMQ Publisher - AI Generation Service
 * Gửi message đến queue để AI Worker xử lý async
 */
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 
  `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASSWORD || "StrongPassword123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

// Queue names (phải khớp với AI_Worker_Service)
const QUEUE_NAME = process.env.RABBITMQ_QUEUE || "ai.generation";
const DLQ_NAME = process.env.RABBITMQ_DLQ || "ai.generation.dlq";
const DLX_NAME = "examora.dlx";

let connection = null;
let channel = null;

/**
 * Kết nối đến RabbitMQ và thiết lập queues
 */
async function connect() {
  if (connection && channel) return;
  
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Đảm bảo queue tồn tại với DLX configuration
    await channel.assertExchange(DLX_NAME, "direct", { durable: true });
    
    // Declare DLQ
    await channel.assertQueue(DLQ_NAME, { durable: true });
    await channel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_NAME);
    
    // Declare main queue với DLX
    await channel.assertQueue(QUEUE_NAME, { 
      durable: true,
      arguments: {
        "x-dead-letter-exchange": DLX_NAME,
        "x-dead-letter-routing-key": DLQ_NAME,
      }
    });
    
    connection.on("error", (err) => {
      console.error("[AI Publisher] Connection error:", err.message);
      connection = null;
      channel = null;
    });
    
    connection.on("close", () => {
      console.log("[AI Publisher] Connection closed");
      connection = null;
      channel = null;
    });
    
    console.log("[AI Publisher] Connected to RabbitMQ, queue:", QUEUE_NAME);
  } catch (error) {
    console.error("[AI Publisher] Failed to connect:", error.message);
    throw error;
  }
}

/**
 * Publish AI generation request vào queue (gửi đến AI Worker)
 */
export async function publishAIGeneration(data) {
  await connect();
  
  const message = {
    request_id: data.requestId,
    task_id: data.taskId,
    user_id: data.userId,
    course_id: data.courseId,
    chapter_id: data.chapterId,
    knowledge_unit_id: data.knowledgeUnitId,
    question_type: data.questionType,
    difficulty: data.difficulty,
    quantity: data.quantity || 10,
    context: data.context,
    trace_id: data.traceId,
    timestamp: new Date().toISOString(),
  };
  
  const success = channel.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,
      contentType: "application/json",
      headers: {
        "x-service": "AI_Generation_Service",
        "x-trace-id": data.traceId,
      },
    }
  );
  
  if (success) {
    console.log(`[AI Publisher] Published AI generation request: ${data.requestId}, task: ${data.taskId}`);
  } else {
    console.error("[AI Publisher] Failed to publish message");
  }
  
  return success;
}

/**
 * Đóng kết nối
 */
export async function close() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("[AI Publisher] Connection closed");
  } catch (error) {
    console.error("[AI Publisher] Error closing:", error.message);
  }
}

export default { publishAIGeneration, close };
