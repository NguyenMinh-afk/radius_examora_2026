import React from "react";
import AdminSidebar from "../../../components/admin/layout/AdminSidebar";
import { AuditLogsPanel } from "../../../components/admin";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as { full_name?: string; email?: string }) : null;
  } catch {
    return null;
  }
};

const AdminAuditLogsPage: React.FC = () => {
  const storedUser = getStoredUser();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-7">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Audit Logs</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review admin actions, access changes, and course visibility updates.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {(storedUser?.full_name || storedUser?.email || "A")[0].toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-900">{storedUser?.full_name || "Admin"}</div>
              <div className="text-xs text-slate-500">{storedUser?.email || "admin account"}</div>
            </div>
          </div>
        </div>

        <AuditLogsPanel />
      </main>
    </div>
  );
};

export default AdminAuditLogsPage;
