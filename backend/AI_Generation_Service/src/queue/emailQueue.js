const { getChannel } = require('./connection');
const config = require('../config/email');

async function sendToQueue(queueName, data) {
  try {
    const channel = await getChannel();
    if (!channel) {
      console.error('❌ No channel available, email not queued:', data.email);
      return false;
    }

    const message = {
      ...data,
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        contentType: 'application/json'
      }
    );

    console.log(`✅ Message sent to queue: ${queueName}`, {
      email: data.email,
      type: data.type
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed to send message to ${queueName}:`, error.message);
    return false;
  }
}

// Welcome email for new users
async function sendWelcomeEmail(userData) {
  return sendToQueue(config.rabbitmq.queues.emailWelcome, {
    type: 'welcome',
    email: userData.email,
    fullName: userData.fullName,
    role: userData.role,
    userId: userData.userId
  });
}

// Approval notification for teachers
async function sendApprovalEmail(userData) {
  return sendToQueue(config.rabbitmq.queues.emailApproval, {
    type: 'approval',
    email: userData.email,
    fullName: userData.fullName,
    userId: userData.userId
  });
}

// Rejection notification for teachers
async function sendRejectionEmail(userData) {
  return sendToQueue(config.rabbitmq.queues.emailRejection, {
    type: 'rejection',
    email: userData.email,
    fullName: userData.fullName,
    reason: userData.reason,
    userId: userData.userId
  });
}

// Exam result notification
async function sendExamResultEmail(examData) {
  return sendToQueue(config.rabbitmq.queues.emailExamResult, {
    type: 'exam_result',
    email: examData.email,
    fullName: examData.fullName,
    examTitle: examData.examTitle,
    score: examData.score,
    totalQuestions: examData.totalQuestions,
    userId: examData.userId
  });
}

// Admin notification
async function sendAdminNotification(notificationData) {
  return sendToQueue(config.rabbitmq.queues.notificationAdmin, {
    type: 'admin_notification',
    adminEmail: notificationData.adminEmail,
    subject: notificationData.subject,
    message: notificationData.message,
    data: notificationData.data
  });
}

module.exports = {
  sendWelcomeEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendExamResultEmail,
  sendAdminNotification
};
