import React from "react";
import { Bell, FileText, Award, AlertCircle, Check, Mail } from "lucide-react";
import type { Notification } from "../../../api/studentApi";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  assignment: { icon: <FileText size={18} />, color: "bg-blue-100 text-blue-600", label: "Bài thi" },
  grade: { icon: <Award size={18} />, color: "bg-green-100 text-green-600", label: "Điểm" },
  system: { icon: <AlertCircle size={18} />, color: "bg-amber-100 text-amber-600", label: "Hệ thống" },
  verification: { icon: <Check size={18} />, color: "bg-purple-100 text-purple-600", label: "Xác minh" },
  email: { icon: <Mail size={18} />, color: "bg-gray-100 text-gray-600", label: "Email" },
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
  const type = typeConfig[notification.type] || { icon: <Bell size={18} />, color: "bg-gray-100 text-gray-600", label: "Khác" };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all p-5
        ${notification.isRead ? "border-slate-200" : "border-blue-200 bg-blue-50/30"}`}
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
                <h3 className="font-semibold text-gray-900">{notification.title || "N/A"}</h3>
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${type.color}`}>
                {type.label}
              </span>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-2">{notification.message || "N/A"}</p>

          <div className="flex items-center gap-3 mt-3">
            {!notification.isRead && onMarkAsRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Check size={16} />
                Đánh dấu đã đọc
              </button>
            )}
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 font-medium"
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
