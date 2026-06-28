/**
 * Email Queue Consumer
 * Xử lý việc gửi email bất đồng bộ qua RabbitMQ
 */
import nodemailer from "nodemailer";
import { getChannel, QUEUES } from "../config/rabbitmq.js";

// Email transporter
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  return transporter;
}

/**
 * Xử lý message gửi email
 */
async function processEmailMessage(msg) {
  const content = JSON.parse(msg.content.toString());
  
  const { to, subject, html, text, from } = content;
  
  if (!to || !subject) {
    console.error("[EmailConsumer] Missing required fields: to, subject");
    return false;
  }
  
  try {
    const mailOptions = {
      from: from || process.env.SMTP_FROM || "noreply@examora.vn",
      to,
      subject,
      text: text || "",
      html: html || "",
    };
    
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`[EmailConsumer] Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EmailConsumer] Failed to send email to ${to}:`, error.message);
    return false;
  }
}

/**
 * Khởi động Email Consumer
 */
export async function startEmailConsumer() {
  const channel = getChannel();
  
  console.log("[EmailConsumer] Starting email consumer...");
  
  await channel.consume(QUEUES.EMAIL_SEND, async (msg) => {
    if (!msg) return;
    
    try {
      const success = await processEmailMessage(msg);
      
      if (success) {
        channel.ack(msg);
      } else {
        // Reject và gửi vào DLQ
        channel.nack(msg, false, false);
      }
    } catch (error) {
      console.error("[EmailConsumer] Error processing message:", error.message);
      channel.nack(msg, false, false);
    }
  });
  
  console.log("[EmailConsumer] Email consumer started and listening on queue:", QUEUES.EMAIL_SEND);
}

export default { startEmailConsumer };
