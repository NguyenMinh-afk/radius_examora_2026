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

import type { AdminRole, AdminUser, Pagination } from "../../api/axios/Admin";

interface UserTableProps {
  users: AdminUser[];
  roles: AdminRole[];
  pagination: Pagination;
  loading: boolean;
  actionUserId: string | null;
  onPageChange: (page: number) => void;
  onRoleChange: (userId: string, roleId: number) => void;
  onToggleActive: (user: AdminUser) => void;
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

const getApprovalClass = (status: string) => {
  if (status === "approved") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
};

const UserTable: React.FC<UserTableProps> = ({
  users,
  roles,
  pagination,
  loading,
  actionUserId,
  onPageChange,
  onRoleChange,
  onToggleActive,
}) => (
  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4">User</th>
            <th className="px-5 py-4">Role</th>
            <th className="px-5 py-4">Access</th>
            <th className="px-5 py-4">Approval</th>
            <th className="px-5 py-4">Last login</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td className="px-5 py-12 text-center text-slate-500" colSpan={6}>
                Loading users...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td className="px-5 py-12 text-center text-slate-500" colSpan={6}>
                No users match the current filters.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="bg-white transition hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                        {getInitials(user.full_name || user.email)}
                      </div>
                    )}

                    <div>
                      <div className="font-semibold text-slate-900">{user.full_name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <select
                    value={user.role_id}
                    disabled={actionUserId === user.id}
                    onChange={(event) => onRoleChange(user.id, Number(event.target.value))}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-slate-100 text-slate-500 ring-slate-200"
                    }`}
                  >
                    {user.is_active ? <Unlock size={13} /> : <Lock size={13} />}
                    {user.is_active ? "Active" : "Locked"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getApprovalClass(
                      user.approval_status
                    )}`}
                  >
                    <CheckCircle2 size={13} />
                    {user.approval_status}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDateTime(user.last_login)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={actionUserId === user.id}
                      onClick={() => onToggleActive(user)}
                      className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        user.is_active
                          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {user.is_active ? <Lock size={15} /> : <ShieldCheck size={15} />}
                      {user.is_active ? "Lock" : "Unlock"}
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
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

    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        Showing page <span className="font-semibold text-slate-700">{pagination.page}</span> of{" "}
        <span className="font-semibold text-slate-700">{pagination.totalPages || 1}</span>,{" "}
        <span className="font-semibold text-slate-700">{pagination.total}</span> total users
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1 || loading}
          onClick={() => onPageChange(pagination.page - 1)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={15} />
          Previous
        </button>

        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages || loading || pagination.totalPages === 0}
          onClick={() => onPageChange(pagination.page + 1)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  </div>
);

export default UserTable;
