import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";

import {
  getAdminAIJobs,
  getAdminQueueJobs,
  type AdminAIJob,
  type AdminQueueJob,
  type Pagination,
} from "../../../api/Admin";

type MonitoringTab = "ai" | "queue";

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 0,
};

const lightStatusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (["completed", "done", "success"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  if (["running", "processing", "started"].includes(normalized)) {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }
  if (["pending", "queued"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }
  if (["failed", "error"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }
  return "bg-slate-100 text-slate-600 ring-slate-200";
};

const darkStatusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (["completed", "done", "success"].includes(normalized)) {
    return "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30";
  }
  if (["running", "processing", "started"].includes(normalized)) {
    return "bg-blue-500/20 text-blue-400 ring-blue-500/30";
  }
  if (["pending", "queued"].includes(normalized)) {
    return "bg-amber-500/20 text-amber-400 ring-amber-500/30";
  }
  if (["failed", "error"].includes(normalized)) {
    return "bg-rose-500/20 text-rose-400 ring-rose-500/30";
  }
  return "bg-slate-700/50 text-slate-300 ring-slate-600";
};

const statusClass = (status: string, isDark: boolean) =>
  isDark ? darkStatusClass(status) : lightStatusClass(status);

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

const shortId = (value?: string | null) => {
  if (!value) return "-";
  return value.length > 14 ? `${value.slice(0, 10)}...` : value;
};

interface MetricCardProps {
  label: string;
  value: number;
  helper: string;
  tone: "blue" | "rose" | "amber" | "violet";
  icon: React.ReactNode;
  isDark?: boolean;
}

const lightToneClasses = {
  blue: "bg-blue-50 text-blue-700",
  rose: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
};

const darkToneClasses = {
  blue: "bg-blue-500/20 text-blue-400",
  rose: "bg-rose-500/20 text-rose-400",
  amber: "bg-amber-500/20 text-amber-400",
  violet: "bg-violet-500/20 text-violet-400",
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, helper, tone, icon, isDark }) => (
  <div className={`rounded-lg border p-4 shadow-sm ${
    isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
  }`}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>{label}</div>
        <div className={`mt-2 text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>{value}</div>
        <div className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>{helper}</div>
      </div>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        isDark ? darkToneClasses[tone] : lightToneClasses[tone]
      }`}>
        {icon}
      </div>
    </div>
  </div>
);

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
      <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.total}</span> total jobs
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

interface JobMonitoringPanelProps {
  isDark?: boolean;
}

const JobMonitoringPanel: React.FC<JobMonitoringPanelProps> = ({ isDark }) => {
  const [activeTab, setActiveTab] = useState<MonitoringTab>("ai");
  const [aiJobs, setAIJobs] = useState<AdminAIJob[]>([]);
  const [queueJobs, setQueueJobs] = useState<AdminQueueJob[]>([]);
  const [aiPagination, setAIPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [queuePagination, setQueuePagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [aiStatus, setAIStatus] = useState("");
  const [queueStatus, setQueueStatus] = useState("");
  const [queueName, setQueueName] = useState("");
  const [jobType, setJobType] = useState("");
  const [traceId, setTraceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAIJobs = useCallback(
    async (page = aiPagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminAIJobs({
          page,
          limit: aiPagination.limit,
          status: aiStatus,
          trace_id: traceId,
        });

        setAIJobs(data.ai_jobs);
        setAIPagination(data.pagination);
      } catch {
        setError("Unable to load AI jobs.");
      } finally {
        setLoading(false);
      }
    },
    [aiPagination.limit, aiPagination.page, aiStatus, traceId]
  );

  const loadQueueJobs = useCallback(
    async (page = queuePagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminQueueJobs({
          page,
          limit: queuePagination.limit,
          status: queueStatus,
          queue_name: queueName,
          job_type: jobType,
          trace_id: traceId,
        });

        setQueueJobs(data.queue_jobs);
        setQueuePagination(data.pagination);
      } catch {
        setError("Unable to load queue jobs.");
      } finally {
        setLoading(false);
      }
    },
    [jobType, queueName, queuePagination.limit, queuePagination.page, queueStatus, traceId]
  );

  const loadCurrentTab = useCallback(
    (page = 1) => {
      if (activeTab === "ai") {
        void loadAIJobs(page);
        return;
      }

      void loadQueueJobs(page);
    },
    [activeTab, loadAIJobs, loadQueueJobs]
  );

  useEffect(() => {
    void loadAIJobs(1);
    void loadQueueJobs(1);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadCurrentTab(1);
  };

  const resetFilters = () => {
    setAIStatus("");
    setQueueStatus("");
    setQueueName("");
    setJobType("");
    setTraceId("");
  };

  const runningAIJobs = aiJobs.filter((job) => job.status.toLowerCase() === "running").length;
  const failedAIJobs = aiJobs.filter((job) => job.status.toLowerCase() === "failed").length;
  const queuedJobs = queueJobs.filter((job) => job.status.toLowerCase() === "queued").length;
  const failedQueueJobs = queueJobs.filter((job) => job.status.toLowerCase() === "failed").length;

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Running AI"
          value={runningAIJobs}
          helper="AI jobs in progress"
          tone="blue"
          icon={<Bot size={22} />}
          isDark={isDark}
        />
        <MetricCard
          label="Failed AI"
          value={failedAIJobs}
          helper="AI jobs failed"
          tone="rose"
          icon={<AlertTriangle size={22} />}
          isDark={isDark}
        />
        <MetricCard
          label="Queued Jobs"
          value={queuedJobs}
          helper="Waiting in queues"
          tone="amber"
          icon={<Clock3 size={22} />}
          isDark={isDark}
        />
        <MetricCard
          label="Queue Failures"
          value={failedQueueJobs}
          helper="Jobs failed in queues"
          tone="violet"
          icon={<MessageSquare size={22} />}
          isDark={isDark}
        />
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

      <div className={`overflow-hidden rounded-lg border shadow-sm ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className={`flex flex-col gap-4 border-b px-5 py-4 xl:flex-row xl:items-center xl:justify-between ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}>
          <div>
            <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Operations Console</h2>
            <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              Inspect job status, retry pressure, trace IDs, and failure messages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className={`rounded-lg p-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                  activeTab === "ai"
                    ? isDark
                      ? "bg-slate-900 text-blue-400 shadow-sm"
                      : "bg-white text-blue-700 shadow-sm"
                    : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Bot size={15} />
                AI Jobs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("queue")}
                className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                  activeTab === "queue"
                    ? isDark
                      ? "bg-slate-900 text-blue-400 shadow-sm"
                      : "bg-white text-blue-700 shadow-sm"
                    : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare size={15} />
                Queue Jobs
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                loadCurrentTab(activeTab === "ai" ? aiPagination.page : queuePagination.page)
              }
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
        </div>

        <form
          onSubmit={handleSubmit}
          className={`grid grid-cols-1 gap-4 border-b p-5 ${
            isDark ? "border-white/10 bg-slate-900/50" : "border-slate-100 bg-slate-50/70"
          } ${
            activeTab === "ai"
              ? "lg:grid-cols-[180px_minmax(260px,1fr)_auto_auto]"
              : "lg:grid-cols-[160px_minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto_auto]"
          }`}
        >
          <label className={`flex flex-col gap-1.5 text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            Status
            <select
              value={activeTab === "ai" ? aiStatus : queueStatus}
              onChange={(event) => {
                if (activeTab === "ai") {
                  setAIStatus(event.target.value);
                  return;
                }

                setQueueStatus(event.target.value);
              }}
              className={`h-10 rounded-lg border px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                isDark
                  ? "border-white/10 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <option value="">All status</option>
              {activeTab === "ai" ? (
                <>
                  <option key="PENDING" value="PENDING">PENDING</option>
                  <option key="RUNNING" value="RUNNING">RUNNING</option>
                  <option key="COMPLETED" value="COMPLETED">COMPLETED</option>
                  <option key="FAILED" value="FAILED">FAILED</option>
                </>
              ) : (
                <>
                  <option key="queued" value="queued">queued</option>
                  <option key="running" value="running">running</option>
                  <option key="completed" value="completed">completed</option>
                  <option key="failed" value="failed">failed</option>
                </>
              )}
            </select>
          </label>

          <label className={`flex flex-col gap-1.5 text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            Trace ID
            <div className="relative">
              <Search
                size={15}
                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-slate-400"}`}
              />
              <input
                value={traceId}
                onChange={(event) => setTraceId(event.target.value)}
                placeholder="Search trace id..."
                className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                  isDark
                    ? "border-white/10 bg-slate-900 text-white placeholder:text-gray-500"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              />
            </div>
          </label>

          {activeTab === "queue" && (
            <>
              <label className={`flex flex-col gap-1.5 text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-600"}`}>
                Queue Name
                <input
                  value={queueName}
                  onChange={(event) => setQueueName(event.target.value)}
                  placeholder="Enter queue name..."
                  className={`h-10 rounded-lg border px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "border-white/10 bg-slate-900 text-white placeholder:text-gray-500"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                />
              </label>

              <label className={`flex flex-col gap-1.5 text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-600"}`}>
                Job Type
                <input
                  value={jobType}
                  onChange={(event) => setJobType(event.target.value)}
                  placeholder="Enter job type..."
                  className={`h-10 rounded-lg border px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "border-white/10 bg-slate-900 text-white placeholder:text-gray-500"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                />
              </label>
            </>
          )}

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

        {activeTab === "ai" ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className={`text-xs font-semibold ${isDark ? "bg-slate-900 text-gray-400" : "bg-white text-slate-500"}`}>
                  <tr className={`border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
                    <th className="px-5 py-4">AI Job ID</th>
                    <th className="px-5 py-4">Document ID</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Retries</th>
                    <th className="px-5 py-4">Trace ID</th>
                    <th className="px-5 py-4">Created At</th>
                    <th className="px-5 py-4">Completed At</th>
                    <th className="px-5 py-4">Error Message</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
                  {loading ? (
                    <tr key="loading">
                      <td className={`px-5 py-12 text-center ${isDark ? "text-gray-400" : "text-slate-500"}`} colSpan={8}>
                        Loading AI jobs...
                      </td>
                    </tr>
                  ) : aiJobs.length === 0 ? (
                    <tr key="empty">
                      <td className={`px-5 py-12 text-center ${isDark ? "text-gray-400" : "text-slate-500"}`} colSpan={8}>
                        No AI jobs match the current filters.
                      </td>
                    </tr>
                  ) : (
                    aiJobs.map((job, index) => (
                      <tr key={`ai-${job.ai_job_id}-${index}`} className={`transition ${isDark ? "bg-slate-900 hover:bg-slate-800/60" : "bg-white hover:bg-slate-50/70"}`}>
                        <td className={`px-5 py-4 font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                          {shortId(job.ai_job_id)}
                        </td>
                        <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{shortId(job.document_id)}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(
                              job.status,
                              Boolean(isDark)
                            )}`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className={`px-5 py-4 font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{job.retry_count}</td>
                        <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{shortId(job.trace_id)}</td>
                        <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{formatDateTime(job.created_at)}</td>
                        <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                          {formatDateTime(job.completed_at)}
                        </td>
                        <td className={`max-w-[260px] truncate px-5 py-4 ${isDark ? "text-rose-400" : "text-rose-600"}`}>
                          {job.error_message || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pager pagination={aiPagination} loading={loading} isDark={isDark} onPageChange={loadAIJobs} />
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className={`text-xs font-semibold ${isDark ? "bg-slate-900 text-gray-400" : "bg-white text-slate-500"}`}>
                  <tr className={`border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
                    <th className="px-5 py-4">Queue Job ID</th>
                    <th className="px-5 py-4">Queue</th>
                    <th className="px-5 py-4">Job Type</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Attempts</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Trace ID</th>
                    <th className="px-5 py-4">Queued At</th>
                    <th className="px-5 py-4">Error Message</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
                  {loading ? (
                    <tr key="loading">
                      <td className={`px-5 py-12 text-center ${isDark ? "text-gray-400" : "text-slate-500"}`} colSpan={9}>
                        Loading queue jobs...
                      </td>
                    </tr>
                  ) : queueJobs.length === 0 ? (
                    <tr key="empty">
                      <td className={`px-5 py-12 text-center ${isDark ? "text-gray-400" : "text-slate-500"}`} colSpan={9}>
                        No queue jobs match the current filters.
                      </td>
                    </tr>
                  ) : (
                    queueJobs.map((job, index) => (
                      <tr key={`queue-${job.id}-${index}`} className={`transition ${isDark ? "bg-slate-900 hover:bg-slate-800/60" : "bg-white hover:bg-slate-50/70"}`}>
                        <td className={`px-5 py-4 font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{shortId(job.id)}</td>
                        <td className={`px-5 py-4 font-medium ${isDark ? "text-white" : "text-slate-700"}`}>{job.queue_name}</td>
                        <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{job.job_type}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(
                              job.status,
                              Boolean(isDark)
                            )}`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className={`px-5 py-4 font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>
                          {job.attempts}/{job.max_attempts}
                        </td>
                        <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{job.priority}</td>
                        <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{shortId(job.trace_id)}</td>
                        <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{formatDateTime(job.queued_at)}</td>
                        <td className={`max-w-[260px] truncate px-5 py-4 ${isDark ? "text-rose-400" : "text-rose-600"}`}>
                          {job.error_message || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pager pagination={queuePagination} loading={loading} isDark={isDark} onPageChange={loadQueueJobs} />
          </>
        )}
      </div>
    </div>
  );
};

export default JobMonitoringPanel;
