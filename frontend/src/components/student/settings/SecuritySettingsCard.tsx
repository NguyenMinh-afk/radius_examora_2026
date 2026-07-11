import React, { useState } from "react";
import { Lock, AlertCircle, Shield, Smartphone } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { changePassword } from "../../../api/studentApi";
import { useTheme } from "../../../contexts/useTheme";

const SecuritySettingsCard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwords.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Mật khẩu mới không khớp!");
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setSuccess(true);
      setShowPasswordForm(false);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosError.response?.data?.error || axiosError.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none border ${
    isDark
      ? "bg-slate-800 border-white/10 text-white"
      : "bg-white border-slate-200 text-gray-900"
  }`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;

  return (
    <SettingsSection
      title="Bảo mật"
      description="Bảo vệ tài khoản của bạn"
      icon={<Shield size={18} />}
      color="green"
    >
      <div className="space-y-6">
        {success && (
          <div className={`p-3 border rounded-lg text-sm ${
            isDark
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-green-50 border-green-200 text-green-600"
          }`}>
            Đổi mật khẩu thành công!
          </div>
        )}

        {/* Change Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
              <Lock size={18} className={isDark ? "text-gray-300" : "text-slate-600"} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Đổi mật khẩu</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>Cập nhật mật khẩu mới</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              isDark
                ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30"
                : "text-blue-600 bg-blue-50 hover:bg-blue-100"
            }`}
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* Password Form */}
        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className={`p-4 rounded-xl space-y-4 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            {error && (
              <div className={`flex items-center gap-2 p-3 border rounded-lg text-sm ${
                isDark
                  ? "bg-red-500/20 border-red-500/30 text-red-400"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className={labelClass}>Mật khẩu hiện tại</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className={inputClass}
                required
                minLength={6}
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tối thiểu 6 ký tự</p>
            </div>
            <div>
              <label className={labelClass}>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className={inputClass}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setError(null);
                  setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className={`px-4 py-2 rounded-lg transition border ${
                  isDark
                    ? "border-white/10 text-gray-300 hover:bg-white/5"
                    : "border-slate-200 text-gray-700 hover:bg-slate-100"
                }`}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Two Factor Auth */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
              <Smartphone size={18} className={isDark ? "text-gray-300" : "text-slate-600"} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Xác thực hai yếu tố (2FA)</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>Thêm lớp bảo mật cho tài khoản</p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              twoFactorEnabled
                ? "bg-blue-600"
                : isDark
                ? "bg-slate-600"
                : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                twoFactorEnabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* Active Sessions */}
        <div className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
              <Shield size={18} className={isDark ? "text-gray-300" : "text-slate-600"} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Phiên đăng nhập</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>Đang hoạt động trên 1 thiết bị</p>
            </div>
          </div>
          <button className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            isDark
              ? "text-red-400 hover:bg-red-500/20"
              : "text-red-600 hover:bg-red-50"
          }`}>
            Đăng xuất tất cả
          </button>
        </div>
      </div>
    </SettingsSection>
  );
};

export default SecuritySettingsCard;