import React from "react";
import { Bell, Check } from "lucide-react";
import type { Notification } from "../../../api/teacherApi";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  isDark?: boolean;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const getTypeConfig = (type: string, isDark?: boolean) => {
  const config: Record<string, { icon: string; color: string; bg: string; label: string }> = isDark
    ? {
        assignment: { icon: "📋", color: "text-blue-400", bg: "bg-blue-500/20", label: "Bài thi" },
        grade: { icon: "✅", color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Điểm" },
        announcement: { icon: "📢", color: "text-purple-400", bg: "bg-purple-500/20", label: "Thông báo" },
        system: { icon: "⚙️", color: "text-gray-400", bg: "bg-white/5", label: "Hệ thống" },
        reminder: { icon: "⏰", color: "text-amber-400", bg: "bg-amber-500/20", label: "Nhắc nhở" },
      }
    : {
        assignment: { icon: "📋", color: "text-blue-600", bg: "bg-blue-100", label: "Bài thi" },
        grade: { icon: "✅", color: "text-green-600", bg: "bg-green-100", label: "Điểm" },
        announcement: { icon: "📢", color: "text-purple-600", bg: "bg-purple-100", label: "Thông báo" },
        system: { icon: "⚙️", color: "text-slate-600", bg: "bg-slate-100", label: "Hệ thống" },
        reminder: { icon: "⏰", color: "text-amber-600", bg: "bg-amber-100", label: "Nhắc nhở" },
      };
  return config[type] || config.system;
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, isDark }) => {
  const typeConfig = getTypeConfig(notification.type, isDark);

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        notification.isRead
          ? isDark
            ? "bg-slate-900 border-white/10 opacity-75"
            : "bg-white border-slate-200 opacity-75"
          : isDark
            ? "bg-slate-900 border-blue-500/30 shadow-blue-500/10 shadow-sm"
            : "bg-white border-blue-200 shadow-blue-100 shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.bg}`}>
          <Bell size={18} className={typeConfig.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{notification.title}</h4>
            {!notification.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
          </div>
          <p className={`text-sm line-clamp-2 mb-2 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{notification.message}</p>
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>{formatTimeAgo(notification.createdAt)}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConfig.bg} ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
          </div>
        </div>

        {!notification.isRead && onMarkRead && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className={`p-2 rounded-lg transition flex-shrink-0 ${
              isDark
                ? "text-gray-500 hover:text-blue-400 hover:bg-blue-500/20"
                : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            }`}
            title="Đánh dấu đã đọc"
          >
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
