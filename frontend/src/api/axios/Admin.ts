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

const buildAuthHeader = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQuery = (params: UserListParams) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
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

export const getAdminRoles = async () => {
  const response = await axios.get<{ roles: AdminRole[] }>(`${ADMIN_API_URL}/roles`, {
    headers: buildAuthHeader(),
  });

  return response.data.roles;
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
