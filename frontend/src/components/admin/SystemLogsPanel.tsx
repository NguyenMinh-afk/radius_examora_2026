import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Eye,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  ServerCog,
  X,
} from "lucide-react";

import {
  getAdminSystemLogs,
  type AdminSystemLog,
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

const statusTone = (status?: string | null) => {
  const normalized = (status || "").toLowerCase();
  if (["created", "ok", "success", "completed"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  if (["pending", "running", "processing"].includes(normalized)) {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }
  if (["failed", "error"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }
  return "bg-slate-100 text-slate-600 ring-slate-200";
};

const payloadPreview = (payload?: Record<string, unknown> | null) => {
  if (!payload) return "-";
  const text = JSON.stringify(payload);
  return text.length > 90 ? `${text.slice(0, 90)}...` : text;
};

const SystemLogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<AdminSystemLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [eventType, setEventType] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [traceId, setTraceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AdminSystemLog | null>(null);

  const loadLogs = useCallback(
    async (page = pagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminSystemLogs({
          page,
          limit: pagination.limit,
          event_type: eventType,
          source,
          status,
          trace_id: traceId,
        });

        setLogs(data.system_logs);
        setPagination(data.pagination);
      } catch {
        setError("Unable to load system logs.");
      } finally {
        setLoading(false);
      }
    },
    [eventType, pagination.limit, pagination.page, source, status, traceId]
  );

  useEffect(() => {
    void loadLogs(1);
  }, []);

  const summary = useMemo(() => {
    const sourceCount = new Set(logs.map((log) => log.source).filter(Boolean)).size;
    const failedCount = logs.filter((log) => (log.status || "").toLowerCase() === "failed").length;
    return { sourceCount, failedCount };
  }, [logs]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadLogs(1);
  };

  const resetFilters = () => {
    setEventType("");
    setSource("");
    setStatus("");
    setTraceId("");
  };

  return (
    <div>
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">System Log Detail</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedLog.event_type}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                aria-label="Close system log detail"
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
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Source</div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    {selectedLog.source || "-"}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusTone(
                        selectedLog.status
                      )}`}
                    >
                      {selectedLog.status || "-"}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Aggregate ID</div>
                  <div className="mt-2 break-all font-mono text-sm text-slate-700">
                    {selectedLog.aggregate_id || "-"}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Trace ID</div>
                  <div className="mt-2 break-all font-mono text-sm text-slate-700">
                    {selectedLog.trace_id || "-"}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-950 p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Payload
                </div>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-100">
                  {JSON.stringify(selectedLog.payload || {}, null, 2)}
                </pre>
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
                Total Events
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-950">{pagination.total}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ServerCog size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Sources
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-950">{summary.sourceCount}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <Radio size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Failed Events
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-950">{summary.failedCount}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle size={21} />
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
            <h2 className="text-base font-bold text-slate-950">System Event Stream</h2>
            <p className="mt-1 text-sm text-slate-500">
              Inspect infrastructure events, service sources, trace IDs, and payloads.
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
          className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50/70 p-5 lg:grid-cols-[minmax(180px,1fr)_160px_minmax(180px,1fr)_minmax(180px,1fr)_auto_auto]"
        >
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Event Type
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
                placeholder="event_type"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All status</option>
              <option value="created">created</option>
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="failed">failed</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Source
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="user-service"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Trace ID
            <input
              value={traceId}
              onChange={(event) => setTraceId(event.target.value)}
              placeholder="trace_id"
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
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-white text-xs font-semibold text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4">Time</th>
                <th className="px-5 py-4">Event Type</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Trace</th>
                <th className="px-5 py-4">Payload</th>
                <th className="px-5 py-4 text-right">Detail</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-12 text-center text-slate-500" colSpan={7}>
                    Loading system logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center text-slate-500" colSpan={7}>
                    No system logs match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="bg-white transition hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-slate-500">{formatDateTime(log.created_at)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{log.event_type}</td>
                    <td className="px-5 py-4 text-slate-500">{log.source || "-"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusTone(
                          log.status
                        )}`}
                      >
                        {log.status || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{shortId(log.trace_id)}</td>
                    <td className="max-w-[320px] truncate px-5 py-4 font-mono text-xs text-slate-600">
                      {payloadPreview(log.payload)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        title="View system log detail"
                        aria-label="View system log detail"
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
            <span className="font-semibold text-slate-700">{pagination.total}</span> total events
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

export default SystemLogsPanel;
