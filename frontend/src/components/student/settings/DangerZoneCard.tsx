import React, { useState } from "react";
import { AlertTriangle, LogOut } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/useTheme";

const DangerZoneCard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <SettingsSection
      title="Vùng nguy hiểm"
      description="Các thao tác không thể hoàn tác"
      icon={<AlertTriangle size={18} className="text-red-500" />}
    >
      <div className="space-y-4">
        <div className={`flex items-center justify-between p-4 border rounded-lg ${
          isDark
            ? "border-red-500/30 bg-red-500/10"
            : "border-red-200 bg-red-50"
        }`}>
          <div>
            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Đăng xuất</p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Đăng xuất khỏi tài khoản này</p>
          </div>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
                isDark
                  ? "border-red-500/40 text-red-400 hover:bg-red-500/20"
                  : "border-red-300 text-red-600 hover:bg-red-100"
              }`}
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className={`px-4 py-2 border rounded-lg transition ${
                  isDark
                    ? "border-white/10 text-gray-300 hover:bg-white/5"
                    : "border-slate-200 text-gray-700 hover:bg-slate-50"
                }`}
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
};

export default DangerZoneCard;