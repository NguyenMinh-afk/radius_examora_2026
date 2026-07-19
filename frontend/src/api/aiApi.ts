/**
 * AI Generation API Service - Gọi AI_Generation_Service qua API Gateway
 * Base URL: http://localhost:3100/api/ai (API Gateway proxy)
 */
import axios, { AxiosError } from "axios";
import { getAuthTokens } from "../utils/auth";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:3100/api/ai";

const aiApi = axios.create({
  baseURL: AI_API_URL,
  timeout: 30000,
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

export default aiApi;
