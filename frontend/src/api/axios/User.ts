
import axios from "axios";

const API_URL = "http://localhost:3001/api/auth";

export interface RegisterData {
	email: string;
	password: string;
	full_name: string;
}

export interface LoginData {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export const registerUser = (data: RegisterData) => {
	return axios.post(`${API_URL}/register`, data);
};

export const loginUser = (data: LoginData) => {
	// Đảm bảo luôn gửi trường rememberMe (mặc định false nếu không có)
	return axios.post(`${API_URL}/login`, {
		email: data.email,
		password: data.password,
		rememberMe: data.rememberMe ?? false,
	});
};
