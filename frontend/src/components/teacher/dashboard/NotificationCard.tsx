import React from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowRight } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationCardProps {
  notifications: Notification[];
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

const getTypeIcon = (type: string) => {
  switch (type) {
    case "assignment":
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      );
    case "grade":
      return (
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "announcement":
      return (
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          <Bell size={14} className="text-slate-500" />
        </div>
      );
  }
};

const NotificationCard: React.FC<NotificationCardProps> = ({ notifications }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Thông báo</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {notifications.filter((n) => !n.isRead).length} thông báo mới
          </p>
        </div>
        <Link
          to="/teacher/notifications"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Xem tất cả
          <ArrowRight size={16} />
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Bell size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Không có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              to="/teacher/notifications"
              className={`flex items-start gap-3 p-3 rounded-xl transition group ${
                item.isRead ? "opacity-60" : ""
              }`}
            >
              {getTypeIcon(item.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {item.message}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
                <span className="text-xs text-slate-400">
                  {formatTimeAgo(item.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
