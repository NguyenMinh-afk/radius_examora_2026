/**
 * Environment Validator - Kiểm tra biến môi trường khi khởi động
 * Nếu thiếu biến bắt buộc → exit ngay
 */

export class EnvValidator {
  static required = [];
  static optional = [];

  static validate() {
    const missing = [];

    for (const key of this.required) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      console.error("\n❌ Missing required environment variables:");
      missing.forEach((key) => console.error(`   - ${key}`));
      console.error("\nApplication cannot start without these variables.\n");
      process.exit(1);
    }

    // Log optional vars that are missing (warning only)
    const warnings = [];
    for (const key of this.optional) {
      if (!process.env[key]) {
        warnings.push(key);
      }
    }

    if (warnings.length > 0 && process.env.NODE_ENV === "development") {
      console.warn("\n⚠️  Optional environment variables not set:");
      warnings.forEach((key) => console.warn(`   - ${key}`));
      console.warn("");
    }

    return true;
  }
}

/**
 * Định nghĩa biến bắt buộc cho từng service
 */
export const serviceEnvConfig = {
  apiGateway: {
    required: [],
    optional: ["PORT", "USER_SERVICE_URL", "EXAM_SERVICE_URL", "QUESTION_SERVICE_URL", "AI_SERVICE_URL", "NOTIFICATION_SERVICE_URL", "INFRA_SERVICE_URL"],
  },
  userService: {
    required: ["JWT_SECRET", "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"],
    optional: ["PORT", "FRONTEND_URL", "JWT_EXPIRES_IN", "GOOGLE_CLIENT_ID"],
  },
  examService: {
    required: ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"],
    optional: ["PORT", "USER_SERVICE_URL", "QUESTION_SERVICE_URL"],
  },
  questionService: {
    required: ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"],
    optional: ["PORT"],
  },
  aiService: {
    required: ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"],
    optional: ["PORT", "GEMINI_API_KEY", "GEMINI_MODEL", "OPENAI_API_KEY", "AI_MODEL"],
  },
  notificationService: {
    required: ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"],
    optional: ["PORT", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"],
  },
  infrastructureService: {
    required: ["RABBITMQ_URL", "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"],
    optional: ["PORT", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"],
  },
};

/**
 * Validate cho service cụ thể
 */
export function validateServiceEnv(serviceName) {
  const config = serviceEnvConfig[serviceName];
  if (!config) {
    console.warn(`Unknown service: ${serviceName}`);
    return true;
  }

  EnvValidator.required = config.required;
  EnvValidator.optional = config.optional;

  return EnvValidator.validate();
}
