import React, { useState } from "react";
import { Shield, Key, Smartphone, X, Eye, EyeOff } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { useTheme } from "../../../contexts/useTheme";

const SecuritySettingsCard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async () => {
    if (passwords.newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    setSaving(true);
    setPasswordError("");
    setTimeout(() => {
      setPasswordSuccess(true);
      setSaving(false);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    }, 1000);
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  return (
    <div>
      <SettingsSection
        title="Bảo mật"
        description="Bảo vệ tài khoản của bạn"
        icon={<Shield size={18} />}
        color="green"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                <Key size={18} className={isDark ? "text-gray-300" : "text-slate-600"} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Đổi mật khẩu</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Cập nhật mật khẩu mới</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 rounded-lg transition"
            >
              Đổi mật khẩu
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                <Smartphone size={18} className={isDark ? "text-gray-300" : "text-slate-600"} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Xác thực hai yếu tố (2FA)</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Thêm lớp bảo mật cho tài khoản</p>
              </div>
            </div>
            <button
              onClick={toggleTwoFactor}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                twoFactorEnabled ? "bg-blue-600" : isDark ? "bg-slate-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  twoFactorEnabled ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          <div className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                <Shield size={18} className={isDark ? "text-gray-300" : "text-slate-600"} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Phiên đăng nhập</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Đang hoạt động trên 1 thiết bị</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition">
              Đăng xuất tất cả
            </button>
          </div>
        </div>
      </SettingsSection>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`rounded-2xl shadow-xl max-w-md w-full ${isDark ? "bg-slate-900 border border-white/10" : "bg-white"}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Đổi mật khẩu</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`p-2 rounded-lg transition ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
              >
                <X size={20} className={isDark ? "text-gray-400" : "text-slate-500"} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400">
                  Đổi mật khẩu thành công!
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ít nhất 8 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <div className={`flex justify-end gap-3 px-6 py-4 border-t ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`px-4 py-2 rounded-lg transition ${isDark ? "text-gray-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}
              >
                Hủy
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={saving || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettingsCard;
