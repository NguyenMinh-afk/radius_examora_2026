import axios from "axios";

export const ADMIN_API_URL =
  import.meta.env.VITE_ADMIN_API_URL || "http://localhost:5000/api/admin";

export interface AdminRole {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  phone?: string | null;
  full_name: string;
  avatar_url?: string | null;
  role_id: number;
  role: string | null;
  is_active: boolean;
  email_verified: boolean;
  phone_verified?: boolean;
  approval_status: string;
  approved_by?: string | null;
  approved_at?: string | null;
  approval_note?: string | null;
  last_login?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AdminCourse {
  id: number;
  faculty_id: number;
  name: string;
  code: string;
  description?: string | null;
  credits: number;
  semester_type?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminAIJob {
  ai_job_id: string;
  document_id: string;
  requested_by: string;
  status: string;
  retry_count: number;
  result_artifact_path?: string | null;
  error_message?: string | null;
  trace_id?: string | null;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
}

export interface AdminQueueJob {
  id: string;
  job_type: string;
  queue_name: string;
  payload: Record<string, unknown>;
  priority: number;
  status: string;
  attempts: number;
  max_attempts: number;
  queued_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  failed_at?: string | null;
  result?: Record<string, unknown> | null;
  error_message?: string | null;
  user_id?: string | null;
  related_id?: string | null;
  trace_id?: string | null;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  actor_id?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface AdminSystemLog {
  id: string;
  event_type: string;
  source?: string | null;
  aggregate_id?: string | null;
  payload?: Record<string, unknown> | null;
  status?: string | null;
  trace_id?: string | null;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  user_id: string;
  recipient_name?: string | null;
  recipient_email?: string | null;
  recipient_role?: string | null;
  target_role?: string | null;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminDashboardSummary {
  users: {
    total: number;
    active: number;
  };
  courses: {
    total: number;
    active: number;
  };
  ai_jobs: {
    pending: number;
    running: number;
    failed: number;
  };
  queue_jobs: {
    queued: number;
    failed: number;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  is_active?: boolean | "";
}

export interface UserListResponse {
  users: AdminUser[];
  pagination: Pagination;
}

export interface CourseListParams {
  page?: number;
  limit?: number;
  search?: string;
  faculty_id?: number | "";
  is_active?: boolean | "";
}

export interface CourseListResponse {
  courses: AdminCourse[];
  pagination: Pagination;
}

export interface AIJobListParams {
  page?: number;
  limit?: number;
  status?: string;
  trace_id?: string;
}

export interface AIJobListResponse {
  ai_jobs: AdminAIJob[];
  pagination: Pagination;
}

export interface QueueJobListParams {
  page?: number;
  limit?: number;
  status?: string;
  queue_name?: string;
  job_type?: string;
  trace_id?: string;
}

export interface QueueJobListResponse {
  queue_jobs: AdminQueueJob[];
  pagination: Pagination;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  action?: string;
  entity_type?: string;
  actor_id?: string;
}

export interface AuditLogListResponse {
  audit_logs: AdminAuditLog[];
  pagination: Pagination;
}

export interface SystemLogListParams {
  page?: number;
  limit?: number;
  event_type?: string;
  source?: string;
  status?: string;
  trace_id?: string;
}

export interface SystemLogListResponse {
  system_logs: AdminSystemLog[];
  pagination: Pagination;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  target?: string;
  search?: string;
}

export interface NotificationListResponse {
  notifications: AdminNotification[];
  pagination: Pagination;
}

export interface CreateNotificationPayload {
  title: string;
  content: string;
  target_role: "all" | "teacher" | "student";
}

export interface CreateNotificationResponse {
  message: string;
  target_role: string;
  recipient_count: number;
  notifications_created: number;
}

const buildAuthHeader = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQuery = <T extends object>(params: T) => {
  const query = new URLSearchParams();

  Object.entries(params as Record<string, string | number | boolean | undefined | "">).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
};

export const getAdminDashboard = async () => {
  const response = await axios.get<AdminDashboardSummary>(`${ADMIN_API_URL}/dashboard`, {
    headers: buildAuthHeader(),
  });

  return response.data;
};

export const getAdminUsers = async (params: UserListParams = {}) => {
  const query = buildQuery(params);
  const response = await axios.get<UserListResponse>(
    `${ADMIN_API_URL}/users${query ? `?${query}` : ""}`,
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const getAdminCourses = async (params: CourseListParams = {}) => {
  const query = buildQuery(params);
  const response = await axios.get<CourseListResponse>(
    `${ADMIN_API_URL}/courses${query ? `?${query}` : ""}`,
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const getAdminRoles = async () => {
  const response = await axios.get<{ roles: AdminRole[] }>(`${ADMIN_API_URL}/roles`, {
    headers: buildAuthHeader(),
  });

  return response.data.roles;
};

export const getAdminAIJobs = async (params: AIJobListParams = {}) => {
  const query = buildQuery(params);
  const response = await axios.get<AIJobListResponse>(
    `${ADMIN_API_URL}/ai-jobs${query ? `?${query}` : ""}`,
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const getAdminQueueJobs = async (params: QueueJobListParams = {}) => {
  const query = buildQuery(params);
  const response = await axios.get<QueueJobListResponse>(
    `${ADMIN_API_URL}/queue-jobs${query ? `?${query}` : ""}`,
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const getAdminAuditLogs = async (params: AuditLogListParams = {}) => {
  const query = buildQuery(params);
  const response = await axios.get<AuditLogListResponse>(
    `${ADMIN_API_URL}/audit-logs${query ? `?${query}` : ""}`,
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const getAdminSystemLogs = async (params: SystemLogListParams = {}) => {
  const query = buildQuery(params);
  const response = await axios.get<SystemLogListResponse>(
    `${ADMIN_API_URL}/system-logs${query ? `?${query}` : ""}`,
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const getAdminNotifications = async (params: NotificationListParams = {}) => {
  const query = buildQuery(params);
  const response = await axios.get<NotificationListResponse>(
    `${ADMIN_API_URL}/notifications${query ? `?${query}` : ""}`,
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const createAdminNotification = async (payload: CreateNotificationPayload) => {
  const response = await axios.post<CreateNotificationResponse>(
    `${ADMIN_API_URL}/notifications`,
    payload,
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const updateAdminCourseStatus = async (courseId: number, isActive: boolean) => {
  const response = await axios.patch<{ message: string; course: AdminCourse }>(
    `${ADMIN_API_URL}/courses/${courseId}/status`,
    { is_active: isActive },
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const updateAdminUserStatus = async (
  userId: string,
  data: { is_active?: boolean; approval_status?: string; approval_note?: string | null }
) => {
  const response = await axios.patch<{ message: string; user: AdminUser }>(
    `${ADMIN_API_URL}/users/${userId}/status`,
    data,
    { headers: buildAuthHeader() }
  );

  return response.data;
};

export const updateAdminUserRole = async (userId: string, roleId: number) => {
  const response = await axios.patch<{ message: string; user: AdminUser }>(
    `${ADMIN_API_URL}/users/${userId}/role`,
    { role_id: roleId },
    { headers: buildAuthHeader() }
  );

  return response.data;
};
