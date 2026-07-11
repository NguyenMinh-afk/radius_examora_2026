import React from "react";
import AdminSidebar from "../../../components/admin/layout/AdminSidebar";
import { JobMonitoringPanel } from "../../../components/admin";
import { useTheme } from "../../../contexts/useTheme";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as { full_name?: string; email?: string }) : null;
  } catch {
    return null;
  }
};

const AdminMonitoringPage: React.FC = () => {
  const storedUser = getStoredUser();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <AdminSidebar />

      <main className={`flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-7 ${isDark ? "text-white" : "text-slate-900"}`}>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>AI/RabbitMQ Operations</h1>
            <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              Monitor asynchronous jobs, queue health, and AI generation execution.
            </p>
          </div>

          <div className={`flex items-center gap-3 rounded-full border py-1 pl-1 pr-3 ${
            isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
          }`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {(storedUser?.full_name || storedUser?.email || "A")[0].toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{storedUser?.full_name || "Admin"}</div>
              <div className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>{storedUser?.email || "admin account"}</div>
            </div>
          </div>
        </div>

        <JobMonitoringPanel isDark={isDark} />
      </main>
    </div>
  );
};

export default AdminMonitoringPage;
