import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Eye,
  X,
  FileClock,
  Filter,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";

import {
  getAdminAuditLogs,
  type AdminAuditLog,
  type Pagination,
} from "../../api/axios/Admin";

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const shortId = (value?: string | null) => {
  if (!value) return "-";
  return value.length > 14 ? `${value.slice(0, 10)}...` : value;
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

const actionTone = (action: string) => {
  if (action.includes("update_role")) return "bg-blue-50 text-blue-700 ring-blue-200";
  if (action.includes("update_status")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (action.includes("course")) return "bg-violet-50 text-violet-700 ring-violet-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
};

const metadataPreview = (metadata?: Record<string, unknown> | null) => {
  if (!metadata) return "-";
  const text = JSON.stringify(metadata);
  return text.length > 90 ? `${text.slice(0, 90)}...` : text;
};

const auditDescription = (log: AdminAuditLog) => {
  const metadata = log.metadata || {};

  if (log.action.includes("user.update_role")) {
    const nextRole = metadata.new_role || metadata.new_role_name || metadata.role;
    return nextRole ? `Changed user role to ${String(nextRole)}` : "Changed user role";
  }

  if (log.action.includes("user.update_status")) {
    const isActive = metadata.is_active;
    if (typeof isActive === "boolean") {
      return isActive ? "Unlocked user account" : "Locked user account";
    }
    return "Updated user access status";
  }

  if (log.action.includes("course.update_status")) {
    const isActive = metadata.is_active;
    if (typeof isActive === "boolean") {
      return isActive ? "Made course visible" : "Hid course from users";
    }
    return "Updated course visibility";
  }

  if (log.action.includes("ai_job") || log.entity_type === "ai_job") {
    return "Recorded AI generation job activity";
  }

  return metadataPreview(log.metadata);
};

const AuditLogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [actorId, setActorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const loadLogs = useCallback(
    async (page = pagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminAuditLogs({
          page,
          limit: pagination.limit,
          action,
          entity_type: entityType,
          actor_id: actorId,
        });

        setLogs(data.audit_logs);
        setPagination(data.pagination);
      } catch {
        setError("Unable to load audit logs.");
      } finally {
        setLoading(false);
      }
    },
    [action, actorId, entityType, pagination.limit, pagination.page]
  );

  useEffect(() => {
    void loadLogs(1);
  }, []);

  const summary = useMemo(() => {
    const actorCount = new Set(logs.map((log) => log.actor_id).filter(Boolean)).size;
    const userActions = logs.filter((log) => log.entity_type === "user").length;
    const courseActions = logs.filter((log) => log.entity_type === "course").length;
    return { actorCount, userActions, courseActions };
  }, [logs]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadLogs(1);
  };

  const resetFilters = () => {
    setAction("");
    setEntityType("");
    setActorId("");
  };

  return (
    <div>
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Audit Log Detail</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedLog.action}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                aria-label="Close audit log detail"
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[calc(86vh-73px)] overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Log ID</div>
                  <div className="mt-2 break-all font-mono text-sm text-slate-700">{selectedLog.id}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Created At</div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    {formatDateTime(selectedLog.created_at)}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Actor ID</div>
                  <div className="mt-2 break-all font-mono text-sm text-slate-700">
                    {selectedLog.actor_id || "-"}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">IP Address</div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    {selectedLog.ip_address || "-"}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Entity</div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    {selectedLog.entity_type || "-"}
                  </div>
                  <div className="mt-1 break-all font-mono text-xs text-slate-500">
                    {selectedLog.entity_id || "-"}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Action</div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${actionTone(
                        selectedLog.action
                      )}`}
                    >
                      {selectedLog.action}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-950 p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Metadata
                </div>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-100">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  User Agent
                </div>
                <div className="break-words text-sm leading-6 text-slate-600">
                  {selectedLog.user_agent || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Total Logs
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-950">{pagination.total}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <FileClock size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Active Actors
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-950">{summary.actorCount}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                User / Course Actions
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-950">
                {summary.userActions}/{summary.courseActions}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <Filter size={21} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">Audit Log Trail</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review admin role, access, and course visibility changes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadLogs(pagination.page)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50/70 p-5 lg:grid-cols-[minmax(180px,1fr)_180px_minmax(220px,1fr)_auto_auto]"
        >
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Action
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={action}
                onChange={(event) => setAction(event.target.value)}
                placeholder="admin.user.update_status"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Entity
            <select
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All entities</option>
              <option value="user">user</option>
              <option value="course">course</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Actor ID
            <input
              value={actorId}
              onChange={(event) => setActorId(event.target.value)}
              placeholder="Filter by actor UUID"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
          <table className="w-full min-w-[1060px] text-left text-sm">
            <thead className="bg-white text-xs font-semibold text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4">Time</th>
                <th className="px-5 py-4">Actor</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Target</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">IP Address</th>
                <th className="px-5 py-4 text-right">Detail</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-12 text-center text-slate-500" colSpan={7}>
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center text-slate-500" colSpan={7}>
                    No audit logs match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="bg-white transition hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-slate-500">{formatDateTime(log.created_at)}</td>
                    <td className="px-5 py-4 text-slate-500">{shortId(log.actor_id)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${actionTone(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{log.entity_type || "-"}</div>
                      <div className="text-xs text-slate-500">{shortId(log.entity_id)}</div>
                    </td>
                    <td className="max-w-[340px] px-5 py-4 text-sm text-slate-600">
                      {auditDescription(log)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{log.ip_address || "-"}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        title="View log detail"
                        aria-label="View audit log detail"
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

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Showing page <span className="font-semibold text-slate-700">{pagination.page}</span>{" "}
            of <span className="font-semibold text-slate-700">{pagination.totalPages || 1}</span>,{" "}
            <span className="font-semibold text-slate-700">{pagination.total}</span> total logs
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => void loadLogs(pagination.page - 1)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading || pagination.totalPages === 0}
              onClick={() => void loadLogs(pagination.page + 1)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPanel;
