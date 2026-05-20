
import axios from "axios";

export const AUTH_API_URL =
	import.meta.env.VITE_AUTH_API_URL || "http://localhost:5000/api/auth";

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
