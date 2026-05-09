
import axios from "axios";

export const AUTH_API_URL =
	import.meta.env.VITE_AUTH_API_URL || "http://localhost:3001/api/auth";

export interface RegisterData {
	email: string;
	password: string;
	full_name: string;
	role: "student" | "teacher";
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
