import React from "react";
import { Bell, CheckCheck } from "lucide-react";
import type { Notification } from "../../../api/teacherApi";
import NotificationItem from "./NotificationItem";
import { EmptyState } from "../shared";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
        >
          <CheckCheck size={16} />
          Đánh dấu đã đọc tất cả ({unreadCount})
        </button>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={36} className="text-slate-300" />}
          title="Không có thông báo nào"
          description="Các thông báo quan trọng sẽ hiển thị tại đây."
        />
      ) : (
        notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />
        ))
      )}
    </div>
  );
};

export default NotificationList;
