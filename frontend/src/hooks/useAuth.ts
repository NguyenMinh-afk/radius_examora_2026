import { useState, useEffect, useCallback } from "react";
import { saveAuthData, clearAuthData, getCurrentUser, getAuthTokens, type AuthUser } from "../utils/auth";
import { loginUser } from "../api/axios/User";

export const useAuth = () => {
	const [user, setUser] = useState(getCurrentUser());
	const [token, setToken] = useState<string | null>(() => {
		const tokens = getAuthTokens();
		return tokens?.accessToken || null;
	});
	const [isLoading, setIsLoading] = useState(false);

	const isAuthenticated = !!token;

	const logout = useCallback(() => {
		clearAuthData();
		setToken(null);
		setUser(null);
	}, []);

	const checkAuth = useCallback(async () => {
		if (!token) return;
		try {
			setIsLoading(true);
			const tokens = getAuthTokens();
			if (tokens?.accessToken) {
				setToken(tokens.accessToken);
			}
		} catch {
			logout();
		} finally {
			setIsLoading(false);
		}
	}, [token, logout]);

	useEffect(() => {
		if (token && !user) {
			checkAuth();
		}
	}, [token, user, checkAuth]);

	const login = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const res = await loginUser({ email, password });
			saveAuthData(res.data);
			setToken(res.data.accessToken || res.data.token);
			setUser(res.data.user || null);
			return { success: true };
		} catch (error: unknown) {
			const err = error as { response?: { data?: { error?: string } }; message?: string };
			return {
				success: false,
				error: err.response?.data?.error || err.message || "Đăng nhập thất bại",
			};
		} finally {
			setIsLoading(false);
		}
	};

	const googleCallbackLogin = async (responseData: {
		success?: boolean;
		accessToken?: string;
		refreshToken?: string;
		token?: string;
		user?: AuthUser | null;
	}) => {
		setIsLoading(true);
		try {
			const accessToken = responseData.accessToken || responseData.token;
			const refreshToken = responseData.refreshToken;
			if (accessToken) {
				saveAuthData({ accessToken, refreshToken, user: responseData.user ?? undefined });
				setToken(accessToken);
				setUser(responseData.user ?? null);
			}
			return { success: true };
		} catch (error: unknown) {
			const err = error as { message?: string };
			return {
				success: false,
				error: err.message || "Đăng nhập Google thất bại",
			};
		} finally {
			setIsLoading(false);
		}
	};

	return {
		user,
		token,
		isAuthenticated,
		isLoading,
		setAuth: saveAuthData,
		updateUser: setUser,
		logout,
		login,
		googleLogin: login,
		googleCallbackLogin,
		checkAuth,
	};
};
