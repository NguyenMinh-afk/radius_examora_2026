/**
 * RabbitMQ Publisher - Notification Service
 * Gửi message đến queue để xử lý async
 */
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 
  `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASSWORD || "StrongPassword123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

// Exchange và Queue names
const EXCHANGE = "examora.topic";
const NOTIFICATION_QUEUE = "notification.send";
const EMAIL_QUEUE = "email.send";
const NOTIFICATION_ROUTING_KEY = "notification.new";
const EMAIL_ROUTING_KEY = "email.send";

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
    
    // Đảm bảo queues tồn tại
    await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
    await channel.assertQueue(EMAIL_QUEUE, { durable: true });
    
    connection.on("error", (err) => {
      console.error("[Notification Publisher] Connection error:", err.message);
      connection = null;
      channel = null;
    });
    
    connection.on("close", () => {
      console.log("[Notification Publisher] Connection closed");
      connection = null;
      channel = null;
    });
    
    console.log("[Notification Publisher] Connected to RabbitMQ");
  } catch (error) {
    console.error("[Notification Publisher] Failed to connect:", error.message);
    throw error;
  }
}

/**
 * Publish notification vào queue
 */
export async function publishNotification(data) {
  await connect();
  
  const message = {
    userId: data.userId,
    type: data.type || "system",
    title: data.title,
    content: data.content,
    metadata: data.metadata || {},
    traceId: data.traceId,
    timestamp: new Date().toISOString(),
  };
  
  const success = channel.publish(
    EXCHANGE,
    NOTIFICATION_ROUTING_KEY,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,
      contentType: "application/json",
      headers: {
        "x-service": "Notification_Service",
        "x-trace-id": data.traceId,
      },
    }
  );
  
  if (success) {
    console.log(`[Notification Publisher] Published notification for user: ${data.userId}`);
  }
  
  return success;
}

/**
 * Publish email vào queue
 */
export async function publishEmail(data) {
  await connect();
  
  const message = {
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text,
    from: data.from,
    traceId: data.traceId,
    timestamp: new Date().toISOString(),
  };
  
  const success = channel.publish(
    EXCHANGE,
    EMAIL_ROUTING_KEY,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,
      contentType: "application/json",
      headers: {
        "x-service": "Notification_Service",
        "x-trace-id": data.traceId,
      },
    }
  );
  
  if (success) {
    console.log(`[Notification Publisher] Published email to: ${data.to}`);
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
    console.log("[Notification Publisher] Connection closed");
  } catch (error) {
    console.error("[Notification Publisher] Error closing:", error.message);
  }
}

export default { publishNotification, publishEmail, close };
