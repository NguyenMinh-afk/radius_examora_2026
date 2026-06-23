import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification
} from "../../../api/studentApi";
import { StudentPageHeader } from "../../../components/student/layout";
import { LoadingState, ErrorState, SearchInput } from "../../../components/student/shared";
import { NotificationFilterBar, NotificationList } from "../../../components/student/notifications";

const StudentNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications({
        limit: 100,
        unreadOnly: filter === "unread"
      });
      setNotifications(data.items || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      console.error("Error fetching notifications:", err);
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter = filter === "all" || (filter === "unread" && !n.isRead);
    const matchesSearch =
      !searchTerm ||
      (n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (n.message?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-8">
      <StudentPageHeader
        title="Thông báo"
        icon={Bell}
        description={
          unreadCount > 0
            ? `Bạn có ${unreadCount} thông báo chưa đọc`
            : "Tất cả thông báo đã được đọc"
        }
      />

      {unreadCount > 0 && (
        <button
          onClick={markAllAsRead}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Đánh dấu đã đọc tất cả
        </button>
      )}

      {loading ? (
        <LoadingState size="lg" text="Đang tải thông báo..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : (
        <>
          <NotificationFilterBar
            filter={filter}
            onFilterChange={setFilter}
            total={total}
            unreadCount={unreadCount}
          />

          <div className="mt-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Tìm kiếm thông báo..."
            />
          </div>

          <div className="mt-6">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StudentNotificationsPage;
