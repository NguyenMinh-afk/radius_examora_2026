import React from "react";
import { Bell } from "lucide-react";
import type { Notification } from "../../../api/notificationApi";
import NotificationItem from "./NotificationItem";

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, isLoading, onMarkAsRead }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
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
        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Không có thông báo nào</p>
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
