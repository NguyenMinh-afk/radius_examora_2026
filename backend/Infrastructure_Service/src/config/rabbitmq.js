/**
 * RabbitMQ Configuration - Infrastructure Service
 * Cấu hình kết nối, exchanges, queues theo kiến trúc Microservice
 */
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 
  `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASSWORD || "StrongPassword123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

// Exchange names
export const EXCHANGES = {
  EXAMORA_TOPIC: "examora.topic",
  EXAMORA_DLX: "examora.dlx", // Dead Letter Exchange
};

// Queue names
export const QUEUES = {
  // AI Generation
  AI_GENERATION: "ai.generation",
  AI_GENERATION_DLQ: "ai.generation.dlq",
  
  // Email notifications
  EMAIL_SEND: "email.send",
  EMAIL_SEND_DLQ: "email.send.dlq",
  
  // In-app notifications
  NOTIFICATION_SEND: "notification.send",
  NOTIFICATION_SEND_DLQ: "notification.send.dlq",
  
  // Exam results
  EXAM_RESULTS: "exam.results",
  EXAM_RESULTS_DLQ: "exam.results.dlq",
};

// Routing keys
export const ROUTING_KEYS = {
  AI_GENERATE: "ai.generate",
  EMAIL_SEND: "email.send",
  NOTIFICATION_NEW: "notification.new",
  EXAM_COMPLETED: "exam.completed",
  USER_REGISTERED: "user.registered",
};

let connection = null;
let channel = null;

/**
 * Kết nối đến RabbitMQ
 */
export async function connectRabbitMQ() {
  if (connection && channel) {
    return { connection, channel };
  }

  try {
    console.log("[RabbitMQ] Connecting to:", RABBITMQ_URL.replace(/:[^:@]+@/, ":***@"));
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Setup prefetch cho consumer
    await channel.prefetch(1);
    
    // Handle connection errors
    connection.on("error", (err) => {
      console.error("[RabbitMQ] Connection error:", err.message);
    });
    
    connection.on("close", () => {
      console.log("[RabbitMQ] Connection closed");
      connection = null;
      channel = null;
    });
    
    console.log("[RabbitMQ] Connected successfully");
    return { connection, channel };
  } catch (error) {
    console.error("[RabbitMQ] Failed to connect:", error.message);
    throw error;
  }
}

/**
 * Thiết lập tất cả exchanges và queues
 */
export async function setupExchangesAndQueues() {
  const { channel: ch } = await connectRabbitMQ();
  
  // 1. Tạo Dead Letter Exchange
  await ch.assertExchange(EXCHANGES.EXAMORA_DLX, "direct", { durable: true });
  
  // 2. Tạo Topic Exchange chính
  await ch.assertExchange(EXCHANGES.EXAMORA_TOPIC, "topic", { durable: true });
  
  // 3. Tạo Queues với DLX
  const queueConfigs = [
    // AI Generation Queue
    {
      queue: QUEUES.AI_GENERATION,
      dlq: QUEUES.AI_GENERATION_DLQ,
      routingKey: ROUTING_KEYS.AI_GENERATE,
    },
    // Email Queue
    {
      queue: QUEUES.EMAIL_SEND,
      dlq: QUEUES.EMAIL_SEND_DLQ,
      routingKey: ROUTING_KEYS.EMAIL_SEND,
    },
    // Notification Queue
    {
      queue: QUEUES.NOTIFICATION_SEND,
      dlq: QUEUES.NOTIFICATION_SEND_DLQ,
      routingKey: ROUTING_KEYS.NOTIFICATION_NEW,
    },
    // Exam Results Queue
    {
      queue: QUEUES.EXAM_RESULTS,
      dlq: QUEUES.EXAM_RESULTS_DLQ,
      routingKey: ROUTING_KEYS.EXAM_COMPLETED,
    },
  ];
  
  for (const config of queueConfigs) {
    // Tạo DLQ trước
    await ch.assertQueue(config.dlq, {
      durable: true,
    });
    await ch.bindQueue(config.dlq, EXCHANGES.EXAMORA_DLX, config.routingKey);
    
    // Tạo main queue với DLX
    await ch.assertQueue(config.queue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": EXCHANGES.EXAMORA_DLX,
        "x-dead-letter-routing-key": config.routingKey,
      },
    });
    await ch.bindQueue(config.queue, EXCHANGES.EXAMORA_TOPIC, config.routingKey);
    
    console.log(`[RabbitMQ] Queue setup: ${config.queue}`);
  }
  
  console.log("[RabbitMQ] All exchanges and queues configured");
}

/**
 * Lấy channel hiện tại
 */
export function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized. Call connectRabbitMQ() first.");
  }
  return channel;
}

/**
 * Đóng kết nối
 */
export async function closeRabbitMQ() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log("[RabbitMQ] Connection closed gracefully");
  } catch (error) {
    console.error("[RabbitMQ] Error closing connection:", error.message);
  }
}

export default {
  connectRabbitMQ,
  setupExchangesAndQueues,
  getChannel,
  closeRabbitMQ,
  EXCHANGES,
  QUEUES,
  ROUTING_KEYS,
};
