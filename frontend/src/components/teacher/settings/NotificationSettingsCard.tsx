import React, { useState } from "react";
import { Bell } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { useTheme } from "../../../contexts/useTheme";

const NotificationSettingsCard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [settings, setSettings] = useState({
    emailNotifications: true,
    examReminders: true,
    deadlineReminders: true,
    gradeNotifications: true,
    studentMessages: true,
  });
  const [success, setSuccess] = useState(false);

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const notificationItems = [
    { key: "emailNotifications" as const, label: "Thông báo qua email", desc: "Nhận thông báo qua hộp thư email" },
    { key: "examReminders" as const, label: "Nhắc bài thi", desc: "Nhận lời nhắc trước khi bài thi bắt đầu" },
    { key: "deadlineReminders" as const, label: "Nhắc deadline", desc: "Nhận thông báo về thời hạn nộp bài" },
    { key: "gradeNotifications" as const, label: "Thông báo điểm", desc: "Nhận thông báo khi có điểm mới" },
    { key: "studentMessages" as const, label: "Tin nhắn từ sinh viên", desc: "Nhận thông báo khi sinh viên gửi tin nhắn" },
  ];

  return (
    <SettingsSection
      title="Cài đặt thông báo"
      description="Quản lý cách bạn nhận thông báo"
      icon={<Bell size={18} />}
      color="indigo"
    >
      <div className="space-y-4">
        {success && (
          <div className={`p-3 border rounded-lg text-sm ${
            isDark
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-green-50 border-green-200 text-green-600"
          }`}>
            Đã lưu cài đặt!
          </div>
        )}

        {notificationItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{item.label}</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>{item.desc}</p>
            </div>
            <button
              onClick={() => toggleSetting(item.key)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings[item.key] ? "bg-blue-600" : isDark ? "bg-slate-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings[item.key] ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
};

export default NotificationSettingsCard;
