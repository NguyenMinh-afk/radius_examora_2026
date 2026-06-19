import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CircleDot,
  Clock,
  Mail,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import {
  getAdminDashboard,
  getAdminRoles,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminDashboardSummary,
  type AdminRole,
  type AdminUser,
  type Pagination,
} from "../../../api/axios/Admin";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import UserTable from "../../../components/admin/UserTable";

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 0,
};

const DEFAULT_SUMMARY: AdminDashboardSummary = {
  users: { total: 0, active: 0 },
  courses: { total: 0, active: 0 },
  ai_jobs: { pending: 0, running: 0, failed: 0 },
  queue_jobs: { queued: 0, failed: 0 },
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as { full_name?: string; email?: string }) : null;
  } catch {
    return null;
  }
};

const AdminDashboard: React.FC = () => {
  const storedUser = useMemo(() => getStoredUser(), []);
  const [summary, setSummary] = useState<AdminDashboardSummary>(DEFAULT_SUMMARY);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [accessFilter, setAccessFilter] = useState<boolean | "">("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (page = pagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminUsers({
          page,
          limit: pagination.limit,
          search,
          role: roleFilter,
          is_active: accessFilter,
        });

        setUsers(data.users);
        setPagination(data.pagination);
      } catch (loadError) {
        setError("Unable to load admin users. Please check the backend server and token.");
      } finally {
        setLoading(false);
      }
    },
    [accessFilter, pagination.limit, pagination.page, roleFilter, search]
  );

  const loadDashboard = useCallback(async () => {
    const data = await getAdminDashboard();
    setSummary(data);
  }, []);

  const loadPageData = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const [dashboardData, roleData, userData] = await Promise.all([
        getAdminDashboard(),
        getAdminRoles(),
        getAdminUsers({
          page: 1,
          limit: DEFAULT_PAGINATION.limit,
          search,
          role: roleFilter,
          is_active: accessFilter,
        }),
      ]);

      setSummary(dashboardData);
      setRoles(roleData);
      setUsers(userData.users);
      setPagination(userData.pagination);
    } catch (loadError) {
      setError("Unable to load admin dashboard. Please sign in again or restart the backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessFilter, roleFilter, search]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadUsers(1);
  };

  const handleRoleChange = async (userId: string, roleId: number) => {
    setActionUserId(userId);
    setError(null);

    try {
      await updateAdminUserRole(userId, roleId);
      await Promise.all([loadUsers(), loadDashboard()]);
    } catch {
      setError("Unable to update user role.");
    } finally {
      setActionUserId(null);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    setActionUserId(user.id);
    setError(null);

    try {
      await updateAdminUserStatus(user.id, {
        is_active: !user.is_active,
        approval_status: user.approval_status,
      });
      await Promise.all([loadUsers(), loadDashboard()]);
    } catch {
      setError("Unable to update user access.");
    } finally {
      setActionUserId(null);
    }
  };

  const activePercent =
    summary.users.total > 0 ? Math.round((summary.users.active / summary.users.total) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Infrastructure Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor access, system queues, and operational status from one admin surface.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
              />
            </form>

            <button
              type="button"
              onClick={() => void loadPageData()}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {(storedUser?.full_name || storedUser?.email || "A")[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">
                  {storedUser?.full_name || "Admin"}
                </div>
                <div className="text-xs text-slate-500">{storedUser?.email || "admin account"}</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Total Users
              </div>
              <Users size={18} className="text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-950">{summary.users.total}</div>
            <div className="mt-2 text-sm text-slate-500">{activePercent}% active accounts</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Active Users
              </div>
              <UserCheck size={18} className="text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-950">{summary.users.active}</div>
            <div className="mt-2 text-sm text-emerald-600">Ready for platform access</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                RabbitMQ Queue
              </div>
              <Activity size={18} className="text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-slate-950">{summary.queue_jobs.queued}</div>
            <div className="mt-2 text-sm text-slate-500">{summary.queue_jobs.failed} failed jobs</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                AI Jobs
              </div>
              <ServerCog size={18} className="text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-slate-950">
              {summary.ai_jobs.pending + summary.ai_jobs.running}
            </div>
            <div className="mt-2 text-sm text-slate-500">{summary.ai_jobs.failed} failed jobs</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">User Management</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review accounts, adjust roles, and control platform access.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:items-center">
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All roles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Access
                  <select
                    value={String(accessFilter)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setAccessFilter(value === "" ? "" : value === "true");
                    }}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All accounts</option>
                    <option value="true">Active only</option>
                    <option value="false">Locked only</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => void loadUsers(1)}
                  className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <CircleDot size={15} />
                  Apply
                </button>
              </div>
            </div>

            <UserTable
              users={users}
              roles={roles}
              pagination={pagination}
              loading={loading}
              actionUserId={actionUserId}
              onPageChange={(page) => void loadUsers(page)}
              onRoleChange={handleRoleChange}
              onToggleActive={handleToggleActive}
            />
          </section>

          <aside className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-950">Access Health</h3>
                <ShieldCheck size={18} className="text-emerald-600" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">Active coverage</span>
                    <span className="font-bold text-slate-900">{activePercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${activePercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-500">Courses</div>
                    <div className="mt-1 text-xl font-bold text-slate-950">
                      {summary.courses.active}/{summary.courses.total}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-500">Running AI</div>
                    <div className="mt-1 text-xl font-bold text-slate-950">
                      {summary.ai_jobs.running}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-950">Operations</h3>
                <Clock size={18} className="text-blue-600" />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Pending AI jobs</span>
                  <span className="font-bold text-slate-950">{summary.ai_jobs.pending}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Queued messages</span>
                  <span className="font-bold text-slate-950">{summary.queue_jobs.queued}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2">
                  <span className="text-rose-700">Failed operations</span>
                  <span className="font-bold text-rose-700">
                    {summary.ai_jobs.failed + summary.queue_jobs.failed}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-950">Notifications</h3>
                <Mail size={18} className="text-slate-400" />
              </div>

              <p className="text-sm leading-6 text-slate-500">
                Role and access changes are recorded in audit logs for review during system
                operation.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
