import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  CircleDot,
  LibraryBig,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  getAdminCourses,
  getAdminDashboard,
  getAdminRoles,
  getAdminUsers,
  updateAdminCourseStatus,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminCourse,
  type AdminDashboardSummary,
  type AdminRole,
  type AdminUser,
  type Pagination,
} from "../../../api/Admin";
import AdminSidebar from "../../../components/admin/layout/AdminSidebar";
import { CourseTable, UserTable } from "../../../components/admin";
import AdminDashboardStats, { AdminOperations, AdminSystemHealth } from "./components/AdminDashboardStats";

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

type AdminSection = "dashboard" | "users" | "courses";

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = useMemo(() => getStoredUser(), []);
  const [activeSection, setActiveSection] = useState<AdminSection>(() => {
    const path = location.pathname;
    if (path === "/admin/courses") return "courses";
    if (path === "/admin/users") return "users";
    return "dashboard";
  });
  const [summary, setSummary] = useState<AdminDashboardSummary>(DEFAULT_SUMMARY);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [userPagination, setUserPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [coursePagination, setCoursePagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [userSearch, setUserSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [accessFilter, setAccessFilter] = useState<boolean | "">("");
  const [courseAccessFilter, setCourseAccessFilter] = useState<boolean | "">("");
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [actionCourseId, setActionCourseId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (page: number = userPagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminUsers({
          page,
          limit: userPagination.limit,
          search: userSearch,
          role: roleFilter,
          is_active: accessFilter,
        });

        setUsers(data.users);
        setUserPagination(data.pagination);
      } catch {
        setError("Unable to load admin users. Please check the backend server and token.");
      } finally {
        setLoading(false);
      }
    },
    [accessFilter, roleFilter, userPagination.limit, userPagination.page, userSearch]
  );

  const loadCourses = useCallback(
    async (page: number = coursePagination.page) => {
      setCourseLoading(true);
      setError(null);

      try {
        const data = await getAdminCourses({
          page,
          limit: coursePagination.limit,
          search: courseSearch,
          is_active: courseAccessFilter,
        });

        setCourses(data.courses);
        setCoursePagination(data.pagination);
      } catch {
        setError("Unable to load courses. Please check the backend server and token.");
      } finally {
        setCourseLoading(false);
      }
    },
    [courseAccessFilter, coursePagination.limit, coursePagination.page, courseSearch]
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
          search: userSearch,
          role: roleFilter,
          is_active: accessFilter,
        }),
      ]);
      const courseData = await getAdminCourses({
        page: 1,
        limit: DEFAULT_PAGINATION.limit,
        search: courseSearch,
        is_active: courseAccessFilter,
      });

      setSummary(dashboardData);
      setRoles(roleData);
      setUsers(userData.users);
      setUserPagination(userData.pagination);
      setCourses(courseData.courses);
      setCoursePagination(courseData.pagination);
    } catch {
      setError("Unable to load admin dashboard. Please sign in again or restart the backend.");
    } finally {
      setLoading(false);
      setCourseLoading(false);
      setRefreshing(false);
    }
  }, [accessFilter, courseAccessFilter, courseSearch, roleFilter, userSearch]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/admin/courses") {
      setActiveSection("courses");
    } else if (path === "/admin/users") {
      setActiveSection("users");
    } else {
      setActiveSection("dashboard");
    }
  }, [location.pathname]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeSection === "courses") {
      void loadCourses(1);
      return;
    }
    void loadUsers(1);
  };

  const navigateToSection = (section: AdminSection) => {
    setActiveSection(section);
    const path = section === "dashboard" ? "/admin" : `/admin/${section}`;
    navigate(path);
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

  const handleToggleCourseActive = async (course: AdminCourse) => {
    setActionCourseId(course.id);
    setError(null);

    try {
      await updateAdminCourseStatus(course.id, !course.is_active);
      await Promise.all([loadCourses(), loadDashboard()]);
    } catch {
      setError("Unable to update course status.");
    } finally {
      setActionCourseId(null);
    }
  };

  const activePercent =
    summary.users.total > 0 ? Math.round((summary.users.active / summary.users.total) * 100) : 0;

  const sectionTitles: Record<AdminSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: "System Administration Dashboard",
      subtitle: "Manage accounts, courses, AI jobs, queues, and operational logs from one admin surface.",
    },
    users: {
      title: "User Management",
      subtitle: "Review accounts, adjust roles, and control platform access.",
    },
    courses: {
      title: "Course Management",
      subtitle: "Review course catalog visibility and keep academic access clean.",
    },
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-7">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {sectionTitles[activeSection].title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{sectionTitles[activeSection].subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {activeSection !== "dashboard" && (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={activeSection === "courses" ? courseSearch : userSearch}
                  onChange={(event) => {
                    if (activeSection === "courses") {
                      setCourseSearch(event.target.value);
                    } else {
                      setUserSearch(event.target.value);
                    }
                  }}
                  placeholder={activeSection === "courses" ? "Search courses..." : "Search users..."}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
                />
              </form>
            )}

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

        {activeSection === "dashboard" && (
          <>
            <AdminDashboardStats summary={summary} />

            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-100 pb-5">
                  <button
                    type="button"
                    onClick={() => navigateToSection("users")}
                    className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
                      "bg-blue-600 text-white shadow-sm"
                    }`}
                  >
                    <Users size={16} />
                    Users
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToSection("courses")}
                    className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
                      "bg-blue-600 text-white shadow-sm"
                    }`}
                  >
                    <LibraryBig size={16} />
                    Courses
                  </button>
                </div>

                <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">User Management</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Review accounts, adjust roles, and control platform access.
                    </p>
                  </div>
                </div>

                <UserTable
                  users={users}
                  roles={roles}
                  pagination={userPagination}
                  loading={loading}
                  actionUserId={actionUserId}
                  onPageChange={(page: number) => void loadUsers(page)}
                  onRoleChange={handleRoleChange}
                  onToggleActive={handleToggleActive}
                />
              </div>

              <aside className="space-y-6">
                <AdminSystemHealth summary={summary} activePercent={activePercent} />
                <AdminOperations summary={summary} />
              </aside>
            </div>
          </>
        )}

        {activeSection === "users" && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
                    <option key="true" value="true">Active only</option>
                    <option key="false" value="false">Locked only</option>
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
              pagination={userPagination}
              loading={loading}
              actionUserId={actionUserId}
              onPageChange={(page: number) => void loadUsers(page)}
              onRoleChange={handleRoleChange}
              onToggleActive={handleToggleActive}
            />
          </div>
        )}

        {activeSection === "courses" && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Course Management</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review course catalog visibility and keep academic access clean.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:items-center">
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Visibility
                  <select
                    value={String(courseAccessFilter)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setCourseAccessFilter(value === "" ? "" : value === "true");
                    }}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All courses</option>
                    <option key="true" value="true">Visible only</option>
                    <option key="false" value="false">Hidden only</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => void loadCourses(1)}
                  className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <CircleDot size={15} />
                  Apply
                </button>
              </div>
            </div>

            <CourseTable
              courses={courses}
              pagination={coursePagination}
              loading={courseLoading}
              actionCourseId={actionCourseId}
              onPageChange={loadCourses}
              onToggleActive={handleToggleCourseActive}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
