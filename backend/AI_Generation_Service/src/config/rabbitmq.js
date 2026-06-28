/**
 * RabbitMQ Publisher - AI Generation Service
 * Gửi message đến queue để xử lý async
 */
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 
  `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASSWORD || "StrongPassword123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

// Exchange và Queue names (phải khớp với Infrastructure_Service)
const EXCHANGE = "examora.topic";
const QUEUE = "ai.generation";
const ROUTING_KEY = "ai.generate";

let connection = null;
let channel = null;

/**
 * Kết nối đến RabbitMQ
 */
async function connect() {
  if (connection && channel) return;
  
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Đảm bảo queue tồn tại (declare)
    await channel.assertQueue(QUEUE, { durable: true });
    
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
    
    console.log("[AI Publisher] Connected to RabbitMQ");
  } catch (error) {
    console.error("[AI Publisher] Failed to connect:", error.message);
    throw error;
  }
}

/**
 * Publish AI generation request vào queue
 */
export async function publishAIGeneration(data) {
  await connect();
  
  const message = {
    requestId: data.requestId,
    userId: data.userId,
    subjectId: data.subjectId,
    chapterId: data.chapterId,
    questionCount: data.questionCount || 10,
    difficulty: data.difficulty || "medium",
    prompt: data.prompt,
    traceId: data.traceId,
    timestamp: new Date().toISOString(),
  };
  
  const success = channel.publish(
    EXCHANGE,
    ROUTING_KEY,
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
    console.log(`[AI Publisher] Published AI generation request: ${data.requestId}`);
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
