import React from "react";
import { Bell, FileText, Award, AlertCircle, Check, Mail } from "lucide-react";
import type { Notification } from "../../../api/notificationApi";
import { useTheme } from "../../../contexts/useTheme";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

const buildTypeConfig = (isDark: boolean) => {
  const config: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    assignment: {
      icon: <FileText size={18} />,
      color: isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600",
      label: "Bài thi",
    },
    grade: {
      icon: <Award size={18} />,
      color: isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-green-100 text-green-600",
      label: "Điểm",
    },
    system: {
      icon: <AlertCircle size={18} />,
      color: isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600",
      label: "Hệ thống",
    },
    verification: {
      icon: <Check size={18} />,
      color: isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600",
      label: "Xác minh",
    },
    email: {
      icon: <Mail size={18} />,
      color: isDark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-600",
      label: "Email",
    },
  };
  return config;
};

const formatTimeAgo = (dateString: string | undefined | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const typeConfig = buildTypeConfig(isDark);
  const type = typeConfig[notification.type] || {
    icon: <Bell size={18} />,
    color: isDark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-600",
    label: "Khác",
  };

  return (
    <div
      className={`rounded-xl shadow-sm border transition-all p-5 ${
        notification.isRead
          ? isDark
            ? "bg-slate-900 border-white/10"
            : "bg-white border-slate-200"
          : isDark
          ? "bg-blue-500/10 border-blue-500/30"
          : "bg-blue-50/30 border-blue-200"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-xl ${type.color}`}>
          {type.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{notification.title || "N/A"}</h3>
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${type.color}`}>
                {type.label}
              </span>
            </div>
            <span className={`text-xs whitespace-nowrap ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>

          <p className={`text-sm mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{notification.message || "N/A"}</p>

          <div className="flex items-center gap-3 mt-3">
            {!notification.isRead && onMarkAsRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className={`flex items-center gap-1 text-sm font-medium ${
                  isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                <Check size={16} />
                Đánh dấu đã đọc
              </button>
            )}
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className={`flex items-center gap-1 text-sm font-medium ${
                  isDark ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"
                }`}
              >
                Xem chi tiết
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;