/**
 * Question API Service - Gọi Question_Service
 * Base URL: http://localhost:3002/api/questions
 */
import axios, { AxiosError } from "axios";
import { getAuthTokens } from "../utils/auth";

const QUESTION_API_URL = import.meta.env.VITE_QUESTION_API_URL || "http://localhost:3002/api/questions";

const questionApi = axios.create({
  baseURL: QUESTION_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

questionApi.interceptors.request.use((config) => {
  const tokens = getAuthTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

questionApi.interceptors.response.use(
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

export interface Question {
  questionId: string;
  content: string;
  difficulty: string;
  bloom: string;
  topic: string;
  courseId: number;
  courseName: string;
  questionType: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface QuestionItem {
  id: string;
  content: string;
  questionType: string;
  difficulty: string;
  chapterId: number | null;
  tags: { id: string; name: string }[];
  answers: { id: string; content: string; isCorrect: boolean }[];
  createdAt: string;
}

export interface QuestionsResponse {
  items: QuestionItem[];
  total: number;
}

export interface CreateQuestionPayload {
  content: string;
  questionType: string;
  difficulty: string;
  chapterId?: number;
  answers: { id?: string; content: string; isCorrect: boolean }[];
  tagIds?: string[];
}

export const getQuestions = async (filters?: {
  search?: string;
  chapterId?: number;
  difficulty?: string;
  limit?: number;
}): Promise<QuestionsResponse> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.chapterId) params.append("chapterId", String(filters.chapterId));
  if (filters?.limit) params.append("limit", String(filters.limit));

  const response = await questionApi.get<QuestionsResponse>(`/?${params.toString()}`);
  return response.data;
};

export const getQuestionById = async (id: string): Promise<QuestionItem> => {
  const response = await questionApi.get<QuestionItem>(`/${id}`);
  return response.data;
};

export const createQuestion = async (payload: CreateQuestionPayload): Promise<QuestionItem> => {
  const response = await questionApi.post<QuestionItem>("/", payload);
  return response.data;
};

export const updateQuestion = async (id: string, payload: CreateQuestionPayload): Promise<QuestionItem> => {
  const response = await questionApi.patch<QuestionItem>(`/${id}`, payload);
  return response.data;
};

export const deleteQuestionApi = async (id: string): Promise<{ success: boolean }> => {
  const response = await questionApi.delete<{ success: boolean }>(`/${id}`);
  return response.data;
};

export default questionApi;
