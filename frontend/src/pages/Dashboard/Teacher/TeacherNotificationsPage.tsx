import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { NotificationList } from "../../../components/teacher/notifications";
import { LoadingState, ErrorState, SectionCard } from "../../../components/teacher/shared";
import type { Notification } from "../../../api/teacherApi";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../../api/notificationApi";
import { useTheme } from "../../../contexts/useTheme";

const TeacherNotificationsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async (filterParam: "all" | "unread" = filter) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications({
        limit: 100,
        unreadOnly: filterParam === "unread",
      });
      setNotifications(data.items);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error ||
          (err as Error).message ||
          "Không thể tải thông báo"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filtered =
      filter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications;
    setDisplayNotifications(filtered);
  }, [filter, notifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error ||
          (err as Error).message ||
          "Không thể đánh dấu đã đọc"
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error ||
          (err as Error).message ||
          "Không thể đánh dấu tất cả đã đọc"
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Thông báo</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            {unreadCount > 0
              ? `${unreadCount} thông báo chưa đọc`
              : "Tất cả đã được đọc"}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`flex gap-1 mb-6 p-1 rounded-xl w-fit ${
        isDark ? "bg-slate-800" : "bg-slate-100"
      }`}>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all"
              ? isDark
                ? "bg-slate-700 text-blue-400 shadow-sm"
                : "bg-white text-blue-700 shadow-sm"
              : isDark
                ? "text-gray-300 hover:text-white"
                : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "unread"
              ? isDark
                ? "bg-slate-700 text-blue-400 shadow-sm"
                : "bg-white text-blue-700 shadow-sm"
              : isDark
                ? "text-gray-300 hover:text-white"
                : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Content */}
      <SectionCard isDark={isDark}>
        {loading ? (
          <LoadingState text="Đang tải thông báo..." isDark={isDark} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchNotifications} isDark={isDark} />
        ) : (
          <NotificationList
            notifications={displayNotifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            isDark={isDark}
          />
        )}
      </SectionCard>
    </div>
  );
};

export default TeacherNotificationsPage;