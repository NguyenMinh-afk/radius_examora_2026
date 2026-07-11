import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
} from "lucide-react";

import {
  getAdminAuditLogs,
  type AdminAuditLog,
  type AuditLogListParams,
  type Pagination,
} from "../../../api/Admin";

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
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

const lightActionColors: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  update: "bg-blue-50 text-blue-700 ring-blue-200",
  delete: "bg-rose-50 text-rose-700 ring-rose-200",
  login: "bg-violet-50 text-violet-700 ring-violet-200",
  logout: "bg-slate-100 text-slate-600 ring-slate-200",
  approve: "bg-green-50 text-green-700 ring-green-200",
  reject: "bg-amber-50 text-amber-700 ring-amber-200",
};

const darkActionColors: Record<string, string> = {
  create: "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30",
  update: "bg-blue-500/20 text-blue-400 ring-blue-500/30",
  delete: "bg-rose-500/20 text-rose-400 ring-rose-500/30",
  login: "bg-violet-500/20 text-violet-400 ring-violet-500/30",
  logout: "bg-slate-700/50 text-slate-300 ring-slate-600",
  approve: "bg-green-500/20 text-green-400 ring-green-500/30",
  reject: "bg-amber-500/20 text-amber-400 ring-amber-500/30",
};

const getActionBadge = (action: string, isDark: boolean) => {
  const colors = isDark ? darkActionColors : lightActionColors;
  const fallback = isDark
    ? "bg-slate-700/50 text-slate-300 ring-slate-600"
    : "bg-slate-100 text-slate-600 ring-slate-200";
  const normalized = action.toLowerCase();
  for (const key of Object.keys(colors)) {
    if (normalized.includes(key)) {
      return colors[key];
    }
  }
  return fallback;
};

interface PagerProps {
  pagination: Pagination;
  loading: boolean;
  isDark?: boolean;
  onPageChange: (page: number) => void;
}

const Pager: React.FC<PagerProps> = ({ pagination, loading, isDark, onPageChange }) => (
  <div className={`flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
    isDark ? "border-white/10" : "border-slate-100"
  }`}>
    <div className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
      Showing page <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.page}</span> of{" "}
      <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.totalPages || 1}</span>,{" "}
      <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.total}</span> total logs
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pagination.page <= 1 || loading}
        onClick={() => onPageChange(pagination.page - 1)}
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
        onClick={() => onPageChange(pagination.page + 1)}
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
);

interface AuditLogsPanelProps {
  className?: string;
  isDark?: boolean;
}

const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({ className = "", isDark }) => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const loadLogs = useCallback(
    async (page = pagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const params: AuditLogListParams = {
          page,
          limit: pagination.limit,
          action: actionFilter || undefined,
          entity_type: entityFilter || undefined,
          actor_id: actorFilter || undefined,
        };

        const data = await getAdminAuditLogs(params);
        setLogs(data.audit_logs);
        setPagination(data.pagination);
      } catch {
        setError("Unable to load audit logs.");
      } finally {
        setLoading(false);
      }
    },
    [actionFilter, actorFilter, entityFilter, pagination.limit, pagination.page]
  );

  useEffect(() => {
    void loadLogs(1);
  }, [loadLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadLogs(1);
  };

  const resetFilters = () => {
    setActionFilter("");
    setEntityFilter("");
    setActorFilter("");
    setSearchValue("");
  };

  return (
    <div className={className}>
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

      <div className={`overflow-hidden rounded-lg border shadow-sm ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className={`flex flex-col gap-4 border-b px-5 py-4 xl:flex-row xl:items-center xl:justify-between ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}>
          <div>
            <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Audit Trail</h2>
            <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              Review admin actions, access changes, and course visibility updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadLogs(pagination.page)}
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
          onSubmit={handleSubmit}
          className={`grid grid-cols-1 gap-4 border-b p-5 lg:grid-cols-[160px_minmax(200px,1fr)_160px_200px_auto_auto] ${
            isDark
              ? "border-white/10 bg-slate-900/50"
              : "border-slate-100 bg-slate-50/70"
          }`}
        >
          <label className={`flex flex-col gap-1.5 text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            Action
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className={`h-10 rounded-lg border px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                isDark
                  ? "border-white/10 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <option value="">All actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
            </select>
          </label>

          <label className={`flex flex-col gap-1.5 text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            Search
            <div className="relative">
              <Search
                size={15}
                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-slate-400"}`}
              />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search logs..."
                className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                  isDark
                    ? "border-white/10 bg-slate-900 text-white placeholder:text-gray-500"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              />
            </div>
          </label>

          <label className={`flex flex-col gap-1.5 text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            Entity Type
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className={`h-10 rounded-lg border px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                isDark
                  ? "border-white/10 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <option value="">All entities</option>
              <option value="user">User</option>
              <option value="course">Course</option>
              <option value="question">Question</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
            </select>
          </label>

          <label className={`flex flex-col gap-1.5 text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            Actor ID
            <input
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              placeholder="Enter actor ID..."
              className={`h-10 rounded-lg border px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                isDark
                  ? "border-white/10 bg-slate-900 text-white placeholder:text-gray-500"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className={`inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg border px-4 text-sm font-semibold transition ${
              isDark
                ? "border-white/10 bg-slate-900 text-gray-300 hover:bg-slate-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <CircleDot size={15} />
            Apply
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className={`text-xs font-semibold ${isDark ? "bg-slate-900 text-gray-400" : "bg-white text-slate-500"}`}>
              <tr className={`border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Actor ID</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Entity</th>
                <th className="px-5 py-4">IP Address</th>
                <th className="px-5 py-4">Details</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
              {loading ? (
                <tr key="loading">
                  <td className={`px-5 py-12 text-center ${isDark ? "text-gray-400" : "text-slate-500"}`} colSpan={6}>
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr key="empty">
                  <td className={`px-5 py-12 text-center ${isDark ? "text-gray-400" : "text-slate-500"}`} colSpan={6}>
                    No audit logs match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr
                    key={`audit-${log.id}-${index}`}
                    className={`transition ${isDark ? "bg-slate-900 hover:bg-slate-800/60" : "bg-white hover:bg-slate-50/70"}`}
                  >
                    <td className={`px-5 py-4 ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className={`px-5 py-4 font-mono text-xs ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                      {log.actor_id ? (
                        <span className="truncate max-w-[120px] block">{log.actor_id}</span>
                      ) : (
                        <span className={isDark ? "text-gray-500" : "text-slate-400"}>System</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getActionBadge(
                          log.action,
                          Boolean(isDark)
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-medium ${isDark ? "text-white" : "text-slate-700"}`}>
                          {log.entity_type || "-"}
                        </span>
                        {log.entity_id && (
                          <span className={`text-xs font-mono truncate max-w-[100px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                            {log.entity_id}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-5 py-4 font-mono text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                      {log.ip_address || "-"}
                    </td>
                    <td className="px-5 py-4">
                      {log.metadata ? (
                        <div className={`flex items-center gap-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          <Shield size={14} />
                          <span className="text-xs">
                            {Object.keys(log.metadata).length} fields
                          </span>
                        </div>
                      ) : (
                        <span className={isDark ? "text-gray-500" : "text-slate-400"}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pager pagination={pagination} loading={loading} isDark={isDark} onPageChange={loadLogs} />
      </div>
    </div>
  );
};

export default AuditLogsPanel;
