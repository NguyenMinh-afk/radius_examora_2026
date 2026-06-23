export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  approval_status?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: AuthUser;
}

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const getRoleFromToken = (token: string) => {
  const payload = decodeJwtPayload(token);
  return typeof payload?.role === "string" ? payload.role : null;
};

export const getDashboardPath = (role?: string | null) => {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/student";
};

export const saveAuthData = (data: AuthResponse) => {
  const accessToken = data.accessToken || data.token;
  if (!accessToken) return null;

  localStorage.setItem("token", accessToken);
  localStorage.setItem("accessToken", accessToken);

  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data.user?.role || getRoleFromToken(accessToken);
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getAuthTokens = (): { accessToken: string; refreshToken?: string } | null => {
  const accessToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!accessToken) return null;
  
  return { accessToken, refreshToken: refreshToken || undefined };
};

export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthTokens();
};

export const isStudent = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "student";
};
