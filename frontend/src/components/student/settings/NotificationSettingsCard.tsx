import React, { useState } from "react";
import { Bell } from "lucide-react";
import SettingsSection from "./SettingsSection";

const NotificationSettingsCard: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    examReminders: true,
    deadlineReminders: true,
    gradeNotifications: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SettingsSection
      title="Cài đặt thông báo"
      description="Quản lý cách bạn nhận thông báo"
      icon={<Bell size={18} />}
    >
      <div className="space-y-4">
        {[
          { key: "emailNotifications", label: "Thông báo qua email", desc: "Nhận thông báo qua hộp thư email" },
          { key: "examReminders", label: "Nhắc bài thi", desc: "Nhận lời nhắc trước khi bài thi bắt đầu" },
          { key: "deadlineReminders", label: "Nhắc deadline", desc: "Nhận thông báo về thời hạn nộp bài" },
          { key: "gradeNotifications", label: "Thông báo điểm", desc: "Nhận thông báo khi có điểm mới" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <button
              onClick={() => toggleSetting(item.key as keyof typeof settings)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings[item.key as keyof typeof settings] ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings[item.key as keyof typeof settings] ? "translate-x-6" : ""
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
