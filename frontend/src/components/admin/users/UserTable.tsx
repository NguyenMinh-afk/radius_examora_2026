import React from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  MoreHorizontal,
  ShieldCheck,
  Unlock,
} from "lucide-react";

import type { AdminRole, AdminUser, Pagination } from "../../../api/Admin";

interface UserTableProps {
  users: AdminUser[];
  roles: AdminRole[];
  pagination: Pagination;
  loading: boolean;
  actionUserId: string | null;
  onPageChange: (page: number) => void;
  onRoleChange: (userId: string, roleId: number) => void;
  onToggleActive: (user: AdminUser) => void;
  isDark?: boolean;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "No activity";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const UserTable: React.FC<UserTableProps> = ({
  users,
  roles,
  pagination,
  loading,
  actionUserId,
  onPageChange,
  onRoleChange,
  onToggleActive,
  isDark,
}) => {
  const handleToggle = (user: AdminUser) => {
    onToggleActive(user);
  };

  return (
    <div className={`overflow-hidden rounded-lg border ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className={`text-xs font-semibold uppercase tracking-wide ${
            isDark ? "bg-slate-800 text-gray-400" : "bg-slate-50 text-slate-500"
          }`}>
            <tr>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>User</th>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Role</th>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Access</th>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Approval</th>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Last login</th>
              <th className={`px-5 py-4 text-right ${isDark ? "text-gray-400" : ""}`}>Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-100"}`}>
            {loading ? (
              <tr>
                <td className={`px-5 py-12 text-center ${isDark ? "text-gray-500" : "text-slate-500"}`} colSpan={6}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className={`px-5 py-12 text-center ${isDark ? "text-gray-500" : "text-slate-500"}`} colSpan={6}>
                  No users match the current filters.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className={`transition ${
                  isDark ? "bg-slate-900 hover:bg-slate-800" : "bg-white hover:bg-slate-50/70"
                }`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                        />
                      ) : (
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                          isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-700"
                        }`}>
                          {getInitials(user.full_name || user.email)}
                        </div>
                      )}

                      <div>
                        <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{user.full_name}</div>
                        <div className={`text-xs ${isDark ? "text-gray-500" : "text-slate-500"}`}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={user.role_id}
                      disabled={actionUserId === user.id}
                      onChange={(event) => onRoleChange(user.id, Number(event.target.value))}
                      className={`h-9 rounded-md border px-3 text-sm font-medium outline-none transition focus:ring-2 disabled:cursor-not-allowed ${
                        isDark
                          ? "bg-slate-800 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20 disabled:bg-slate-700"
                          : "bg-white border-slate-200 text-slate-700 focus:border-blue-500 focus:ring-blue-100 disabled:bg-slate-50"
                      }`}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        user.is_active
                          ? isDark ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30" : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : isDark ? "bg-slate-700 text-gray-400 ring-slate-600" : "bg-slate-100 text-slate-500 ring-slate-200"
                      }`}
                    >
                      {user.is_active ? <Unlock size={13} /> : <Lock size={13} />}
                      {user.is_active ? "Active" : "Locked"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        user.approval_status === "approved"
                          ? isDark ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30" : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : user.approval_status === "pending"
                            ? isDark ? "bg-amber-500/20 text-amber-400 ring-amber-500/30" : "bg-amber-50 text-amber-700 ring-amber-200"
                            : isDark ? "bg-rose-500/20 text-rose-400 ring-rose-500/30" : "bg-rose-50 text-rose-700 ring-rose-200"
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      {user.approval_status}
                    </span>
                  </td>

                  <td className={`px-5 py-4 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                    {formatDateTime(user.last_login)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={actionUserId === user.id}
                        onClick={() => handleToggle(user)}
                        className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          user.is_active
                            ? isDark
                              ? "border border-white/10 bg-slate-800 text-white hover:bg-slate-700"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {user.is_active ? <Lock size={15} /> : <ShieldCheck size={15} />}
                        {user.is_active ? "Lock" : "Unlock"}
                      </button>

                      <button
                        type="button"
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
                          isDark
                            ? "border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                        aria-label={`Open actions for ${user.full_name}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
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
        <div className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
          Showing page <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.page}</span> of{" "}
          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.totalPages || 1}</span>,{" "}
          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.total}</span> total users
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => onPageChange(pagination.page - 1)}
            className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDark
                ? "border-white/10 text-gray-300 hover:bg-white/5"
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
                ? "border-white/10 text-gray-300 hover:bg-white/5"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
