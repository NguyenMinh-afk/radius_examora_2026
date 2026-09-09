import nodemailer from 'nodemailer';
import { getChannel, QUEUES } from '../config/rabbitmq.js';
import {
  handleReliableMessage,
  NonRetryableMessageError,
} from './reliable-message.consumer.js';

export const EMAIL_CONSUMER_NAME = 'email-consumer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
  return transporter;
}

function parseEmailMessage(message) {
  let content;
  try {
    content = JSON.parse(message.content.toString());
  } catch {
    throw new NonRetryableMessageError('Message content is not valid JSON');
  }

  if (!content.to || !content.subject) {
    throw new NonRetryableMessageError('Missing required fields: to, subject');
  }
  return content;
}

async function processEmailMessage(message, messageId) {
  const { to, subject, html, text, from } = parseEmailMessage(message);
  const safeMessageId = String(messageId).replace(/[^a-zA-Z0-9._-]/g, '');
  const info = await getTransporter().sendMail({
    from: from || process.env.SMTP_FROM || 'noreply@examora.vn',
    to,
    subject,
    text: text || '',
    html: html || '',
    messageId: `<${safeMessageId}@rabbitmq.examora.local>`,
  });
  console.log(`[EmailConsumer] Email sent to ${to}: ${info.messageId}`);
}

export async function startEmailConsumer() {
  const channel = getChannel();
  console.log('[EmailConsumer] Starting email consumer...');

  await channel.consume(QUEUES.EMAIL_SEND, async (message) => {
    await handleReliableMessage({
      channel,
      message,
      retryQueue: QUEUES.EMAIL_SEND_RETRY,
      consumerName: EMAIL_CONSUMER_NAME,
      processMessage: processEmailMessage,
    });
  });

  console.log('[EmailConsumer] Email consumer started and listening on queue:', QUEUES.EMAIL_SEND);
}

export default { startEmailConsumer };
