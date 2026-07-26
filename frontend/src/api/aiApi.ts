/**
 * AI Generation API Service - Gọi AI_Generation_Service qua API Gateway
 * Base URL: http://localhost:3100/api/ai (API Gateway proxy)
 */
import axios, { AxiosError } from "axios";
import { getAuthTokens } from "../utils/auth";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:3000/api/ai";

const aiApi = axios.create({
  baseURL: AI_API_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

aiApi.interceptors.request.use((config) => {
  const tokens = getAuthTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

aiApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    // Xử lý rate limit graceful - không crash UI
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded. Please wait a moment.");
      // Reject với message rõ ràng thay vì crash
      return Promise.reject(new Error("Too many requests. Please wait and try again."));
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Types
// ============================================================================

export interface AIGenerationRequest {
  id: string;
  courseId: number | null;
  chapterId: number | null;
  knowledgeUnitId: number | null;
  questionType: string | null;
  difficulty: string | null;
  quantity: number;
  context: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  errorMessage: string | null;
  traceId: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface GenerationResponse {
  requestId: string;
  status: string;
  message: string;
  traceId: string;
}

export interface GenerationStatusResponse {
  id: string;
  status: string;
  progress: number;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  traceId: string;
  tasks: GenerationTask[];
  logs: GenerationLog[];
}

export interface GenerationTask {
  id: string;
  requestId: string;
  subjectId: number;
  topic: string | null;
  inputType: string | null;
  inputReference: string | null;
  numberOfQuestions: number;
  difficulty: string | null;
  status: string;
  createdBy: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface GenerationLog {
  id: string;
  requestId: string;
  questionId: string | null;
  aiModel: string;
  prompt: string | null;
  response: string | null;
  tokensUsed: number | null;
  cost: number | null;
  status: string;
  errorMessage: string | null;
  traceId: string | null;
  createdAt: string;
}

export interface GenerationHistoryItem {
  id: string;
  status: string;
  progress: number;
  quantity: number;
  difficulty: string | null;
  questionType: string | null;
  courseId: number | null;
  chapterId: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface GenerationHistoryResponse {
  items: GenerationHistoryItem[];
}

export interface CreateGenerationPayload {
  userId?: string;
  courseId?: number;
  chapterId?: number;
  knowledgeUnitId?: number;
  questionType?: string;
  difficulty?: string;
  quantity?: number;
  context?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Tạo yêu cầu sinh câu hỏi bằng AI
 */
export const createGenerationRequest = async (
  payload: CreateGenerationPayload
): Promise<GenerationResponse> => {
  const response = await aiApi.post<GenerationResponse>(
    "/generate-questions",
    payload
  );
  return response.data;
};

/**
 * Lấy trạng thái của một yêu cầu sinh câu hỏi
 */
export const getGenerationRequestStatus = async (
  requestId: string
): Promise<GenerationStatusResponse> => {
  const response = await aiApi.get<GenerationStatusResponse>(
    `/requests/${requestId}`
  );
  return response.data;
};

/**
 * Lấy lịch sử các yêu cầu sinh câu hỏi của user
 */
export const getGenerationHistory = async (
  limit: number = 20
): Promise<GenerationHistoryResponse> => {
  const response = await aiApi.get<GenerationHistoryResponse>(
    `/requests?limit=${limit}`
  );
  return response.data;
};

// ============================================================================
// Review Types
// ============================================================================

export interface PendingQuestion {
  id: string;
  taskId: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  difficulty: string;
  topic: string | null;
  explanation: string | null;
  status: string;
  createdAt: string;
}

export interface PendingQuestionsResponse {
  items: PendingQuestion[];
  total: number;
}

export interface ApproveResponse {
  questionId: string;
  status: string;
  message: string;
  questionBankId: number | null;
}

export interface RejectResponse {
  questionId: string;
  status: string;
  message: string;
}

// ============================================================================
// Review API Functions
// ============================================================================

/**
 * Lấy danh sách câu hỏi đang chờ duyệt
 */
interface PendingQuestionRaw {
  id: string;
  task_id: string;
  question_content: string;
  // Support both formats: options object (new) or individual fields (legacy)
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  difficulty: string;
  topic: string | null;
  explanation: string | null;
  status: string;
  created_at: string;
}

export const getPendingQuestions = async (
  taskId?: string,
  difficulty?: string,
  topic?: string
): Promise<PendingQuestionsResponse> => {
  const params = new URLSearchParams();
  if (taskId) params.append("task_id", taskId);
  if (difficulty) params.append("difficulty", difficulty);
  if (topic) params.append("topic", topic);

  const response = await aiApi.get<{ items: PendingQuestionRaw[]; total: number }>(
    `/questions/pending-review?${params.toString()}`
  );

  // Transform from API response - support both options object and legacy fields
  const items: PendingQuestion[] = response.data.items.map((item: PendingQuestionRaw) => {
    // Prefer options object format, fallback to individual fields
    const optionA = item.options?.A || item.option_a || "";
    const optionB = item.options?.B || item.option_b || "";
    const optionC = item.options?.C || item.option_c || "";
    const optionD = item.options?.D || item.option_d || "";

    return {
      id: item.id,
      taskId: item.task_id,
      questionContent: item.question_content,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer: item.correct_answer || "",
      difficulty: item.difficulty || "medium",
      topic: item.topic || null,
      explanation: item.explanation || null,
      status: item.status,
      createdAt: item.created_at,
    };
  });

  return { items, total: response.data.total };
};

/**
 * Duyệt một câu hỏi AI - copy sang ngân hàng câu hỏi
 */
export const approveQuestion = async (
  questionId: string
): Promise<ApproveResponse> => {
  const response = await aiApi.post<ApproveResponse>(
    `/questions/${questionId}/approve`
  );
  return response.data;
};

/**
 * Từ chối một câu hỏi AI
 */
export const rejectQuestion = async (
  questionId: string,
  reason?: string
): Promise<RejectResponse> => {
  const response = await aiApi.post<RejectResponse>(
    `/questions/${questionId}/reject`,
    reason ? { reason } : {}
  );
  return response.data;
};

/**
 * Duyệt tất cả câu hỏi đang chờ
 */
export const approveAllQuestions = async (
  questionIds: string[]
): Promise<{ approved: number; failed: number }> => {
  const results = { approved: 0, failed: 0 };

  for (const id of questionIds) {
    try {
      await approveQuestion(id);
      results.approved++;
    } catch {
      results.failed++;
    }
  }

  return results;
};

export default aiApi;
