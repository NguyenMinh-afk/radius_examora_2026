import React from "react";
import {
  Activity,
  ServerCog,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import type { AdminDashboardSummary } from "../../../../api/Admin";

interface AdminDashboardStatsProps {
  summary: AdminDashboardSummary;
  isDark?: boolean;
}

const AdminDashboardStats: React.FC<AdminDashboardStatsProps> = ({ summary, isDark }) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className={`rounded-lg border p-5 shadow-sm ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className="mb-4 flex items-center justify-between">
          <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-slate-400"}`}>Total Users</div>
          <Users size={18} className="text-blue-600" />
        </div>
        <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{summary.users.total}</div>
        <div className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
          {Math.round((summary.users.total > 0 ? (summary.users.active / summary.users.total) * 100 : 0))}% active accounts
        </div>
      </div>

      <div className={`rounded-lg border p-5 shadow-sm ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className="mb-4 flex items-center justify-between">
          <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-slate-400"}`}>Active Accounts</div>
          <UserCheck size={18} className="text-emerald-600" />
        </div>
        <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{summary.users.active}</div>
        <div className="mt-2 text-sm text-emerald-600">Ready for platform access</div>
      </div>

      <div className={`rounded-lg border p-5 shadow-sm ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className="mb-4 flex items-center justify-between">
          <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-slate-400"}`}>Queued Messages</div>
          <Activity size={18} className="text-amber-600" />
        </div>
        <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{summary.queue_jobs.queued}</div>
        <div className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
          {summary.queue_jobs.queued} queued {summary.queue_jobs.queued === 1 ? "message" : "messages"}
        </div>
      </div>

      <div className={`rounded-lg border p-5 shadow-sm ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className="mb-4 flex items-center justify-between">
          <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-slate-400"}`}>AI Jobs</div>
          <ServerCog size={18} className="text-indigo-600" />
        </div>
        <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
          {summary.ai_jobs.pending + summary.ai_jobs.running}
        </div>
        <div className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
          {summary.ai_jobs.failed} failed {summary.ai_jobs.failed === 1 ? "job" : "jobs"}
        </div>
      </div>
    </div>
  );
};

interface AdminSystemHealthProps {
  summary: AdminDashboardSummary;
  activePercent: number;
  isDark?: boolean;
}

export const AdminSystemHealth: React.FC<AdminSystemHealthProps> = ({ summary, activePercent, isDark }) => (
  <div className={`rounded-lg border p-5 shadow-sm ${
    isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
  }`}>
    <div className="mb-4 flex items-center justify-between">
      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>System Health</h3>
      <ShieldCheck size={18} className="text-emerald-600" />
    </div>

    <div className="space-y-4">
      <div>
        <div className={`mb-2 flex items-center justify-between text-sm ${isDark ? "text-gray-400" : ""}`}>
          <span className={`font-medium ${isDark ? "text-gray-300" : "text-slate-600"}`}>Active accounts</span>
          <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{activePercent}%</span>
        </div>
        <div className={`h-2 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
          <div className="h-2 rounded-full bg-blue-600" style={{ width: `${activePercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-lg p-3 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <div className={`text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-500"}`}>Courses</div>
          <div className={`mt-1 text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
            {summary.courses.active}/{summary.courses.total}
          </div>
        </div>
        <div className={`rounded-lg p-3 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <div className={`text-xs font-semibold ${isDark ? "text-gray-400" : "text-slate-500"}`}>Running AI</div>
          <div className={`mt-1 text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{summary.ai_jobs.running}</div>
        </div>
      </div>
    </div>
  </div>
);

interface AdminOperationsProps {
  summary: AdminDashboardSummary;
  isDark?: boolean;
}

export const AdminOperations: React.FC<AdminOperationsProps> = ({ summary, isDark }) => (
  <div className={`rounded-lg border p-5 shadow-sm ${
    isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
  }`}>
    <div className="mb-4 flex items-center justify-between">
      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Operations</h3>
      <Activity size={18} className="text-blue-600" />
    </div>

    <div className="space-y-3 text-sm">
      <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
        <span className={isDark ? "text-gray-300" : "text-slate-600"}>Pending AI jobs</span>
        <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{summary.ai_jobs.pending}</span>
      </div>
      <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
        <span className={isDark ? "text-gray-300" : "text-slate-600"}>Queued messages</span>
        <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{summary.queue_jobs.queued}</span>
      </div>
      <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${isDark ? "bg-rose-500/10" : "bg-rose-50"}`}>
        <span className={isDark ? "text-rose-400" : "text-rose-700"}>Failed operations</span>
        <span className={`font-bold ${isDark ? "text-rose-400" : "text-rose-700"}`}>
          {summary.ai_jobs.failed + summary.queue_jobs.failed}
        </span>
      </div>
    </div>
  </div>
);

export default AdminDashboardStats;
