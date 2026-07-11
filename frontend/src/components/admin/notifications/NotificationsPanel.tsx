import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Eye,
  RefreshCw,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";

import {
  createAdminNotification,
  getAdminNotifications,
  type AdminNotification,
  type CreateNotificationPayload,
  type Pagination,
} from "../../../api/Admin";
import ConfirmDialog from "../shared/ConfirmDialog";

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 0,
};

const targetLabels: Record<CreateNotificationPayload["target_role"], string> = {
  all: "All users",
  teacher: "Teachers",
  student: "Students",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const targetFromNotification = (notification: AdminNotification) => {
  const target = (notification.target_role || "all") as CreateNotificationPayload["target_role"];
  return targetLabels[target] || notification.type;
};

interface NotificationsPanelProps {
  isDark?: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isDark }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<CreateNotificationPayload["target_role"]>("all");
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  const loadNotifications = useCallback(
    async (page = pagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminNotifications({
          page,
          limit: pagination.limit,
          target: targetFilter,
          search,
        });

        setNotifications(data.notifications);
        setPagination(data.pagination);
      } catch {
        setError("Unable to load notification history.");
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, pagination.page, search, targetFilter]
  );

  useEffect(() => {
    void loadNotifications(1);
  }, []);

  const summary = useMemo(() => {
    const sentCount = pagination.total;
    const unreadCount = notifications.filter((notification) => !notification.is_read).length;
    const targetCount = new Set(
      notifications.map((notification) => notification.target_role || notification.type)
    ).size;
    return { sentCount, unreadCount, targetCount };
  }, [notifications, pagination.total]);

  const sendNotification = async () => {
    setError(null);
    setSuccess(null);
    setSending(true);

    try {
      const result = await createAdminNotification({
        title: title.trim(),
        content: content.trim(),
        target_role: targetRole,
      });

      setTitle("");
      setContent("");
      setConfirmSendOpen(false);
      setSuccess(`Sent to ${result.recipient_count} recipient(s).`);
      await loadNotifications(1);
    } catch {
      setError("Unable to send notification. Please check recipients and try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setConfirmSendOpen(true);
  };

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadNotifications(1);
  };

  const cardBg = isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200";
  const cardInnerBg = isDark ? "bg-slate-800/60" : "bg-slate-50";
  const mutedText = isDark ? "text-gray-400" : "text-slate-500";
  const boldText = isDark ? "text-white" : "text-slate-950";
  const bodyText = isDark ? "text-gray-300" : "text-slate-700";
  const inputBase = isDark
    ? "border-white/10 bg-slate-900 text-white placeholder:text-gray-500"
    : "border-slate-200 bg-white text-slate-700";

  return (
    <div className="space-y-5">
      <ConfirmDialog
        open={confirmSendOpen}
        title="Send broadcast notification"
        message={`Send this notification to ${targetLabels[targetRole]}?`}
        confirmText="Send notification"
        loading={sending}
        onCancel={() => setConfirmSendOpen(false)}
        onConfirm={() => void sendNotification()}
      />
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className={`max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-lg shadow-xl ${isDark ? "bg-slate-900" : "bg-white"}`}>
            <div className={`flex items-start justify-between border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div>
                <h3 className={`text-lg font-bold ${boldText}`}>Notification Detail</h3>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  Broadcast record and recipient delivery state.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
                  isDark
                    ? "border-white/10 text-gray-400 hover:bg-slate-800 hover:text-white"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                aria-label="Close notification detail"
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[calc(86vh-73px)] overflow-y-auto p-5">
              <div className={`mb-5 rounded-lg border p-4 ${cardBg}`}>
                <div className={`mb-2 text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                  Title
                </div>
                <div className={`text-base font-bold ${boldText}`}>
                  {selectedNotification.title}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className={`rounded-lg p-4 ${cardInnerBg}`}>
                  <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                    Target
                  </div>
                  <div className={`mt-2 text-sm font-semibold ${bodyText}`}>
                    {targetFromNotification(selectedNotification)}
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${cardInnerBg}`}>
                  <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                    Created
                  </div>
                  <div className={`mt-2 text-sm font-semibold ${bodyText}`}>
                    {formatDateTime(selectedNotification.created_at)}
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${cardInnerBg}`}>
                  <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                    Recipient
                  </div>
                  <div className={`mt-2 text-sm font-semibold ${bodyText}`}>
                    {selectedNotification.recipient_name || "Unknown user"}
                  </div>
                  <div className={`mt-1 break-all text-xs ${mutedText}`}>
                    {selectedNotification.recipient_email || selectedNotification.user_id}
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${cardInnerBg}`}>
                  <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                    Status
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        selectedNotification.is_read
                          ? isDark
                            ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30"
                            : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : isDark
                          ? "bg-amber-500/20 text-amber-400 ring-amber-500/30"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                      }`}
                    >
                      {selectedNotification.is_read ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`mt-4 rounded-lg border p-4 ${cardBg}`}>
                <div className={`mb-2 text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                  Message
                </div>
                <p className={`whitespace-pre-wrap text-sm leading-6 ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                  {selectedNotification.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className={`rounded-lg border p-5 shadow-sm ${cardBg}`}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className={`text-lg font-bold ${boldText}`}>Broadcast Notification</h2>
              <p className={`mt-1 text-sm ${mutedText}`}>
                Send a platform announcement to all users, teachers, or students.
              </p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-700"
            }`}>
              <Send size={20} />
            </div>
          </div>

          {error && (
            <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
              isDark
                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}>
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
              isDark
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}>
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className={`block text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
              Target audience
              <select
                value={targetRole}
                onChange={(event) =>
                  setTargetRole(event.target.value as CreateNotificationPayload["target_role"])
                }
                className={`mt-1.5 h-11 w-full rounded-lg border px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${inputBase}`}
              >
                <option value="all">All users</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
              </select>
            </label>

            <label className={`block text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={160}
                placeholder="System maintenance notice"
                className={`mt-1.5 h-11 w-full rounded-lg border px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${inputBase}`}
              />
            </label>

            <label className={`block text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
              Message
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="Write a short, clear announcement for platform users."
                className={`mt-1.5 w-full resize-none rounded-lg border px-3 py-3 text-sm font-medium normal-case leading-6 tracking-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${inputBase}`}
              />
            </label>

            <div className={`flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div className={`text-xs ${mutedText}`}>
                This action is recorded in audit logs.
              </div>
              <button
                type="submit"
                disabled={sending || !title.trim() || !content.trim()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <div className={`rounded-lg border p-5 shadow-sm ${cardBg}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-base font-bold ${boldText}`}>Delivery Summary</h3>
              <BellRing size={18} className={isDark ? "text-blue-400" : "text-blue-600"} />
            </div>

            <div className="space-y-3">
              <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${cardInnerBg}`}>
                <span className={mutedText}>Sent records</span>
                <span className={`font-bold ${boldText}`}>{summary.sentCount}</span>
              </div>
              <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${cardInnerBg}`}>
                <span className={mutedText}>Unread in page</span>
                <span className={`font-bold ${boldText}`}>{summary.unreadCount}</span>
              </div>
              <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${cardInnerBg}`}>
                <span className={mutedText}>Target groups</span>
                <span className={`font-bold ${boldText}`}>{summary.targetCount}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-lg border p-5 shadow-sm ${cardBg}`}>
            <div className={`mb-3 flex items-center gap-2 text-sm font-bold ${boldText}`}>
              <Users size={17} className={isDark ? "text-gray-400" : "text-slate-500"} />
              Recipient Rules
            </div>
            <p className={`text-sm leading-6 ${mutedText}`}>
              Broadcasts are saved as personal notifications for active recipients, so each user
              can view and mark their own messages as read.
            </p>
          </div>
        </aside>
      </div>

      <section className={`overflow-hidden rounded-lg border shadow-sm ${cardBg}`}>
        <div className={`flex flex-col gap-4 border-b px-5 py-4 xl:flex-row xl:items-center xl:justify-between ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}>
          <div>
            <h2 className={`text-base font-bold ${boldText}`}>Notification History</h2>
            <p className={`mt-1 text-sm ${mutedText}`}>
              Review recent broadcast records and recipient delivery state.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadNotifications(pagination.page)}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
              isDark
                ? "border-blue-500/30 bg-slate-900 text-blue-400 hover:bg-blue-500/10"
                : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
            }`}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <form
          onSubmit={handleFilterSubmit}
          className={`grid grid-cols-1 gap-4 border-b p-5 md:grid-cols-[minmax(220px,1fr)_180px_auto] ${
            isDark ? "border-white/10 bg-slate-900/50" : "border-slate-100 bg-slate-50/70"
          }`}
        >
          <label className={`flex flex-col gap-1.5 text-xs font-semibold ${mutedText}`}>
            Search
            <div className="relative">
              <Search
                size={15}
                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-slate-400"}`}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or content"
                className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${inputBase}`}
              />
            </div>
          </label>

          <label className={`flex flex-col gap-1.5 text-xs font-semibold ${mutedText}`}>
            Target
            <select
              value={targetFilter}
              onChange={(event) => setTargetFilter(event.target.value)}
              className={`h-10 rounded-lg border px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${inputBase}`}
            >
              <option value="">All targets</option>
              <option value="all">All users</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
            </select>
          </label>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <CircleDot size={15} />
            Apply
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className={`text-xs font-semibold ${isDark ? "bg-slate-900 text-gray-400" : "bg-white text-slate-500"}`}>
              <tr className={`border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Target</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Detail</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
              {loading ? (
                <tr>
                  <td className={`px-5 py-12 text-center ${mutedText}`} colSpan={6}>
                    Loading notifications...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td className={`px-5 py-12 text-center ${mutedText}`} colSpan={6}>
                    No notifications match the current filters.
                  </td>
                </tr>
              ) : (
                notifications.map((notification) => (
                  <tr key={notification.id} className={`transition ${isDark ? "bg-slate-900 hover:bg-slate-800/60" : "bg-white hover:bg-slate-50/70"}`}>
                    <td className={`px-5 py-4 ${mutedText}`}>
                      {formatDateTime(notification.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        isDark
                          ? "bg-blue-500/20 text-blue-400 ring-blue-500/30"
                          : "bg-blue-50 text-blue-700 ring-blue-200"
                      }`}>
                        {targetFromNotification(notification)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{notification.title}</div>
                      <div className={`mt-1 max-w-[420px] truncate text-xs ${mutedText}`}>
                        {notification.content}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`font-medium ${bodyText}`}>
                        {notification.recipient_name || "Unknown user"}
                      </div>
                      <div className={`text-xs ${mutedText}`}>
                        {notification.recipient_email || notification.user_id}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          notification.is_read
                            ? isDark
                              ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30"
                              : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : isDark
                            ? "bg-amber-500/20 text-amber-400 ring-amber-500/30"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                        }`}
                      >
                        {notification.is_read ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedNotification(notification)}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
                          isDark
                            ? "border-white/10 text-gray-400 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                            : "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                        title="View notification detail"
                        aria-label="View notification detail"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
          isDark ? "border-white/10" : "border-slate-100"
        }`}>
          <div className={`text-sm ${mutedText}`}>
            Showing page <span className={`font-semibold ${boldText}`}>{pagination.page}</span>{" "}
            of <span className={`font-semibold ${boldText}`}>{pagination.totalPages || 1}</span>,{" "}
            <span className={`font-semibold ${boldText}`}>{pagination.total}</span> total records
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => void loadNotifications(pagination.page - 1)}
              className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isDark
                  ? "border-white/10 text-gray-300 hover:bg-slate-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading || pagination.totalPages === 0}
              onClick={() => void loadNotifications(pagination.page + 1)}
              className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isDark
                  ? "border-white/10 text-gray-300 hover:bg-slate-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotificationsPanel;
