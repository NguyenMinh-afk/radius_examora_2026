import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { NotificationList } from "../../../components/teacher/notifications";
import { LoadingState, ErrorState, SectionCard } from "../../../components/teacher/shared";
import type { Notification } from "../../../api/teacherApi";

// TODO: Gọi Notification_Service
const mockNotifications: Notification[] = [];

const TeacherNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [loading, setLoading] = useState(false); // TODO: = true when API connected
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>(mockNotifications);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: const data = await getTeacherNotifications();
      // setNotifications(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const filtered = filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;
    setDisplayNotifications(filtered);
  }, [filter, notifications]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} thông báo chưa đọc`
              : "Tất cả đã được đọc"}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "unread" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Content */}
      <SectionCard>
        {loading ? (
          <LoadingState text="Đang tải thông báo..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchNotifications} />
        ) : (
          <NotificationList
            notifications={displayNotifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />
        )}
      </SectionCard>
    </div>
  );
};

export default TeacherNotificationsPage;
