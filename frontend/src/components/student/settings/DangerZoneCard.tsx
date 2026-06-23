import React, { useState } from "react";
import { AlertTriangle, LogOut } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { useNavigate } from "react-router-dom";

const DangerZoneCard: React.FC = () => {
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
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <p className="text-sm font-medium text-gray-900">Đăng xuất</p>
            <p className="text-xs text-gray-500">Đăng xuất khỏi tài khoản này</p>
          </div>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-100 transition"
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
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
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
