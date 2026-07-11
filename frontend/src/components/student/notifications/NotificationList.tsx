import React from "react";
import { Bell } from "lucide-react";
import type { Notification } from "../../../api/notificationApi";
import NotificationItem from "./NotificationItem";
import { useTheme } from "../../../contexts/useTheme";

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, isLoading, onMarkAsRead }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`rounded-xl shadow-sm border p-5 animate-pulse ${
            isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
          }`}>
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-xl ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
              <div className="flex-1">
                <div className={`h-4 rounded w-1/3 mb-2 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
                <div className={`h-3 rounded w-2/3 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell size={48} className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>Không có thông báo nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};

export default NotificationList;