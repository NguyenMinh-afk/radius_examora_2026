module.exports = {
  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  },
  
  // Email defaults
  from: {
    name: 'EXAMORA',
    email: process.env.SMTP_FROM || 'noreply@examora.vn'
  },
  
  // RabbitMQ Configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queues: {
      emailWelcome: 'email.welcome',
      emailApproval: 'email.approval',
      emailRejection: 'email.rejection',
      emailExamResult: 'email.exam_result',
      notificationAdmin: 'notification.admin'
    }
  }
};
