
import axios from "axios";

export const AUTH_API_URL =
	import.meta.env.VITE_AUTH_API_URL || "http://localhost:5000/api/auth";

export const NOTIFICATION_API_URL =
	import.meta.env.VITE_NOTIFICATION_API_URL || "http://localhost:5000/api/notifications";

export interface RegisterData {
	email: string;
	password: string;
	full_name: string;
	role: "student" | "teacher";
}

export interface ProfileResponse {
	profile: Record<string, unknown> | null;
	isComplete: boolean;
}

export interface CompleteProfilePayload {
	student_code?: string;
	faculty?: string;
	class_code?: string;
	teacher_code?: string;
	department?: string;
	specialization?: string;
}

export interface UserNotification {
	id: string;
	user_id: string;
	type: string;
	title: string;
	content: string;
	is_read: boolean;
	created_at: string;
}

export interface NotificationPagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface NotificationListResponse {
	notifications: UserNotification[];
	pagination: NotificationPagination;
}

export interface LoginData {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export const registerUser = (data: RegisterData) => {
	return axios.post(`${AUTH_API_URL}/register`, data);
};

export const loginUser = (data: LoginData) => {
	return axios.post(`${AUTH_API_URL}/login`, {
		email: data.email,
		password: data.password,
		rememberMe: data.rememberMe ?? false,
	});
};

export const getGoogleLoginUrl = () => `${AUTH_API_URL}/google`;

const buildAuthHeader = () => {
	const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
	return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProfile = () => {
	return axios.get<ProfileResponse>(`${AUTH_API_URL}/profile`, {
		headers: buildAuthHeader(),
	});
};

export const completeProfile = (data: CompleteProfilePayload) => {
	return axios.post(`${AUTH_API_URL}/profile`, data, {
		headers: buildAuthHeader(),
	});
};

export const getMyNotifications = (params: { page?: number; limit?: number; unread_only?: boolean } = {}) => {
	const query = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined) query.set(key, String(value));
	});

	return axios.get<NotificationListResponse>(
		`${NOTIFICATION_API_URL}${query.toString() ? `?${query.toString()}` : ""}`,
		{ headers: buildAuthHeader() }
	);
};

export const markNotificationAsRead = (notificationId: string) => {
	return axios.patch(
		`${NOTIFICATION_API_URL}/${notificationId}/read`,
		{},
		{ headers: buildAuthHeader() }
	);
};

export const markAllNotificationsAsRead = () => {
	return axios.patch(`${NOTIFICATION_API_URL}/read-all`, {}, { headers: buildAuthHeader() });
};
