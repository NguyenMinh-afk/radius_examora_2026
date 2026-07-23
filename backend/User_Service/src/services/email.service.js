/**
 * Email Service - Gửi email qua RabbitMQ → Infrastructure Service gửi
 */
import amqp from "amqplib";
import { randomUUID } from "node:crypto";

const RABBITMQ_URL = process.env.RABBITMQ_URL ||
  `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASSWORD || "StrongPassword123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

const EXCHANGE = "examora.topic";
const ROUTING_KEY = "email.send";

let connection = null;
let channel = null;
const returnedMessages = new Map();

/**
 * Kết nối RabbitMQ (lazy connection)
 */
async function getChannel() {
  if (channel) return channel;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createConfirmChannel();
    channel.on("return", (message) => {
      const messageId = message.properties.messageId;
      if (messageId) {
        returnedMessages.set(
          messageId,
          new Error(
            `RabbitMQ returned unroutable email ${messageId}: ${message.fields.replyText || "NO_ROUTE"}`,
          ),
        );
      }
    });

    connection.on("error", (err) => {
      console.error("[EmailService] RabbitMQ connection error:", err.message);
      channel = null;
    });

    connection.on("close", () => {
      console.log("[EmailService] RabbitMQ connection closed");
      channel = null;
    });

    console.log("[EmailService] Connected to RabbitMQ");
    return channel;
  } catch (error) {
    console.error("[EmailService] Failed to connect to RabbitMQ:", error.message);
    throw error;
  }
}

/**
 * Gửi message email vào queue (Infrastructure Service sẽ gửi email thực)
 */
async function publishEmail({ to, subject, html, text, type = "general" }) {
  const ch = await getChannel();

  const message = {
    to,
    subject,
    html,
    text: text || "",
    type,
    from: process.env.SMTP_FROM || "EXAMORA <noreply@examora.vn>",
    timestamp: new Date().toISOString(),
  };

  const buffer = Buffer.from(JSON.stringify(message));
  const messageId = randomUUID();

  return new Promise((resolve, reject) => {
    ch.publish(
      EXCHANGE,
      ROUTING_KEY,
      buffer,
      {
        persistent: true,
        mandatory: true,
        contentType: "application/json",
        messageId,
        correlationId: messageId,
        type: ROUTING_KEY,
      },
      (err) => {
        setImmediate(() => {
          const returnedError = returnedMessages.get(messageId);
          returnedMessages.delete(messageId);
          if (err || returnedError) {
            reject(err || returnedError);
            return;
          }
          console.log(`[EmailService] Email queued for ${to}: ${subject}`);
          resolve(true);
        });
      }
    );
  });
}

/**
 * Gửi email đặt lại mật khẩu
 */
export async function sendPasswordResetEmail({ to, resetUrl, userName, expiresInMinutes = 15 }) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .button:hover { opacity: 0.9; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔑 Đặt lại mật khẩu</h1>
    </div>
    <div class="content">
      <p>Xin chào <strong>${userName}</strong>,</p>
      <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản EXAMORA của mình.</p>
      <p>Nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
      </div>
      <div class="warning">
        <strong>⚠️ Lưu ý:</strong>
        <ul>
          <li>Link này sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>.</li>
          <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</li>
          <li>Không chia sẻ link này với bất kỳ ai.</li>
        </ul>
      </div>
      <p>Hoặc copy link bên dưới vào trình duyệt:</p>
      <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px; font-size: 12px;">${resetUrl}</p>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động từ EXAMORA.</p>
      <p>© ${new Date().getFullYear()} EXAMORA - Hệ thống thi trực tuyến</p>
    </div>
  </div>
</body>
</html>
`;

  const text = `
Xin chào ${userName},

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản EXAMORA của mình.

Nhấp vào link bên dưới để đặt lại mật khẩu:
${resetUrl}

Lưu ý:
- Link này sẽ hết hạn sau ${expiresInMinutes} phút.
- Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
- Không chia sẻ link này với bất kỳ ai.

© ${new Date().getFullYear()} EXAMORA
`;

  return publishEmail({
    to,
    subject: "🔑 Đặt lại mật khẩu EXAMORA",
    html,
    text,
    type: "password_reset",
  });
}

/**
 * Gửi email thông báo mật khẩu đã thay đổi
 */
export async function sendPasswordChangedEmail({ to, userName }) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
    .warning { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 15px 0; color: #155724; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Mật khẩu đã được thay đổi</h1>
    </div>
    <div class="content">
      <p>Xin chào <strong>${userName}</strong>,</p>
      <p>Mật khẩu tài khoản EXAMORA của bạn đã được thay đổi thành công.</p>
      <div class="warning">
        <strong>📌 Nếu bạn không thực hiện thay đổi này:</strong>
        <p>Vui lòng liên hệ hỗ trợ ngay lập tức hoặc đặt lại mật khẩu khác.</p>
      </div>
      <p>Để bảo mật tài khoản, chúng tôi đã đăng xuất bạn khỏi tất cả các thiết bị khác.</p>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động từ EXAMORA.</p>
      <p>© ${new Date().getFullYear()} EXAMORA - Hệ thống thi trực tuyến</p>
    </div>
  </div>
</body>
</html>
`;

  return publishEmail({
    to,
    subject: "✅ Mật khẩu EXAMORA đã được thay đổi",
    html,
    text: "",
    type: "password_changed",
  });
}

export default {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};
