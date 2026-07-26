/**
 * Notification API Service - Gọi API từ Notification Service
 * Base URL: http://localhost:3004/api/notifications
 */
import axios, { AxiosError } from "axios";
import { getAuthTokens } from "../utils/auth";

const NOTIFICATION_API_URL = import.meta.env.VITE_NOTIFICATION_API_URL || "http://localhost:3004/api/notifications";

// Tạo axios instance
const notificationApi = axios.create({
  baseURL: NOTIFICATION_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào request
notificationApi.interceptors.request.use(
  (config) => {
    const tokens = getAuthTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để transform response - map snake_case -> camelCase
const transformNotification = (notification: {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
  action_url?: string | null;
  actionUrl?: string | null;
}) => ({
  id: notification.id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  isRead: notification.is_read,
  createdAt: notification.created_at || "",
  actionUrl: notification.action_url || notification.actionUrl || null,
});

// Interceptor để xử lý response
notificationApi.interceptors.response.use(
  (response) => {
    // Transform items array if present
    if (response.data?.items && Array.isArray(response.data.items)) {
      response.data.items = response.data.items.map(transformNotification);
    }
    // Transform single notification response
    if (response.data && response.data.id && !Array.isArray(response.data)) {
      response.data = transformNotification(response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded. Please wait a moment.");
      return Promise.reject(new Error("Too many requests. Please wait and try again."));
    }
    return Promise.reject(error);
  }
);

// Types
export interface Notification {
  id: string;
  type: "assignment" | "grade" | "system" | "verification" | "email";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface NotificationResponse {
  items: Notification[];
  total: number;
  unreadCount: number;
}

// API Functions

/**
 * Lấy danh sách thông báo
 */
export const getNotifications = async (filters?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<NotificationResponse> => {
  const params = new URLSearchParams();
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());
  if (filters?.unreadOnly) params.append("unreadOnly", "true");

  const response = await notificationApi.get<NotificationResponse>(
    `/?${params.toString()}`
  );
  return response.data;
};

/**
 * Đánh dấu một thông báo là đã đọc
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await notificationApi.patch(`/${notificationId}/read`);
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await notificationApi.patch(`/read-all`);
};

export default notificationApi;
