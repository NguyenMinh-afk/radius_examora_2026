import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { getNotificationSettings, updateNotificationSettings, type NotificationSettings } from "../../../api/studentApi";

const NotificationSettingsCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    examReminders: true,
    deadlineReminders: true,
    gradeNotifications: true,
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getNotificationSettings();
      setSettings(data);
    } catch {
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setSuccess(false);

    try {
      setSaving(true);
      await updateNotificationSettings(newSettings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    } finally {
      setSaving(false);
    }
  };

  const notificationItems = [
    { key: "emailNotifications", label: "Thông báo qua email", desc: "Nhận thông báo qua hộp thư email" },
    { key: "examReminders", label: "Nhắc bài thi", desc: "Nhận lời nhắc trước khi bài thi bắt đầu" },
    { key: "deadlineReminders", label: "Nhắc deadline", desc: "Nhận thông báo về thời hạn nộp bài" },
    { key: "gradeNotifications", label: "Thông báo điểm", desc: "Nhận thông báo khi có điểm mới" },
  ];

  return (
    <SettingsSection
      title="Cài đặt thông báo"
      description="Quản lý cách bạn nhận thông báo"
      icon={<Bell size={18} />}
    >
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-48 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              Đã lưu cài đặt!
            </div>
          )}

          {notificationItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleSetting(item.key as keyof NotificationSettings)}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
                  settings[item.key as keyof NotificationSettings] ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings[item.key as keyof NotificationSettings] ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </SettingsSection>
  );
};

export default NotificationSettingsCard;
