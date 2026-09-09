import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "../../../api/notificationApi";
import { LoadingState, ErrorState } from "../../../components/student/shared";
import { NotificationFilterBar, NotificationList } from "../../../components/student/notifications";
import { PageHeader, Card, FilterBar } from "../../../components/shared";
import { useTheme } from "../../../contexts/useTheme";

const StudentNotificationsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

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

  if (loading) {
    return (
      <div>
        <LoadingState size="lg" text="Đang tải thông báo..." isDark={isDark} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Thông báo"
        icon={Bell}
        description={
          unreadCount > 0
            ? `Bạn có ${unreadCount} thông báo chưa đọc`
            : "Tất cả thông báo đã được đọc"
        }
        actions={
          unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className={`inline-flex h-11 items-center gap-2 px-5 rounded-lg transition font-semibold text-sm ${
                isDark
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Đánh dấu tất cả đã đọc
            </button>
          )
        }
      />

      <Card className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={fetchNotifications} isDark={isDark} />
        ) : (
          <>
            <NotificationFilterBar
              filter={filter}
              onFilterChange={setFilter}
              total={total}
              unreadCount={unreadCount}
            />

            <FilterBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm kiếm thông báo..."
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />

            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default StudentNotificationsPage;