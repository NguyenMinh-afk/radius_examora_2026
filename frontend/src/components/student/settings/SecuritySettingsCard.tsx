import React, { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { changePassword } from "../../../api/studentApi";

const SecuritySettingsCard: React.FC = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  return (
    <SettingsSection
      title="Bảo mật"
      description="Quản lý mật khẩu và bảo vệ tài khoản"
      icon={<Lock size={18} />}
    >
      <div className="space-y-4">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            Đổi mật khẩu thành công!
          </div>
        )}

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Đổi mật khẩu
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Lưu mật khẩu"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setError(null);
                  setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="px-4 py-2 border border-slate-200 text-gray-700 rounded-lg hover:bg-slate-50 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </SettingsSection>
  );
};

export default SecuritySettingsCard;
