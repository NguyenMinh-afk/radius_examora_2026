import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveAuthData, getDashboardPath } from "../../utils/auth";
import { googleResultApi } from "../../api/axios/User";

const GoogleOAuthCallbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const run = async () => {
      const state = params.get("state");
      const urlError = params.get("error");
      const urlMessage = params.get("message");

      if (urlError) {
        setErrorMessage(urlMessage || `Google OAuth error: ${urlError}`);
        return;
      }

      if (!state) {
        setErrorMessage("Thiếu trạng thái đăng nhập Google. Vui lòng thử lại.");
        return;
      }

      try {
        const res = await googleResultApi(state);
        const data = res.data;

        if (!data?.success || !data?.accessToken || !data?.user) {
          setErrorMessage("Không lấy được thông tin đăng nhập Google. Vui lòng thử lại.");
          return;
        }

        const role = saveAuthData({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || undefined,
          token: data.accessToken,
          user: data.user,
        });

        navigate(getDashboardPath(role), { replace: true });
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = axiosErr.response?.data?.message || axiosErr.message || "Đăng nhập Google thất bại. Vui lòng thử lại.";
        setErrorMessage(msg);
      }
    };

    run();
  }, [params, navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-slate-100 to-teal-100 px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đăng nhập Google thất bại</h2>
          <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg text-sm hover:scale-[1.02] transition"
          >
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-slate-100 to-teal-100 px-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center max-w-md w-full">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang hoàn tất đăng nhập Google</h2>
        <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát...</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallbackPage;
