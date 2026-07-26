import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Lock,
  MoreHorizontal,
  ShieldCheck,
  Trash2,
  Unlock,
  X,
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
  onEditUser: (userId: string, data: { full_name: string; email: string; role_id: number }) => void;
  onDeleteUser: (userId: string) => void;
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

// ---- Edit User Modal ----
interface EditModalProps {
  user: AdminUser;
  roles: AdminRole[];
  onClose: () => void;
  onSave: (userId: string, data: { full_name: string; email: string; role_id: number }) => void;
  isDark?: boolean;
}

const EditUserModal: React.FC<EditModalProps> = ({ user, roles, onClose, onSave, isDark }) => {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [roleId, setRoleId] = useState(user.role_id);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    console.log("EditUserModal - handleSubmit called", { full_name: fullName.trim(), email: email.trim(), role_id: roleId });
    setSaving(true);
    await onSave(user.id, { full_name: fullName.trim(), email: email.trim(), role_id: roleId });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-md rounded-xl border shadow-2xl ${
          isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
        }`}
      >
        <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Edit User
          </h2>
          <button
            onClick={onClose}
            className={`rounded-md p-1.5 transition ${
              isDark ? "text-gray-400 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
              Role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                isDark
                  ? "bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-100"
              }`}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className={`flex gap-3 pt-2`}>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                isDark
                  ? "border-white/10 text-gray-300 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !fullName.trim() || !email.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ---- Delete Confirmation Modal ----
interface DeleteModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (userId: string) => void;
  isDark?: boolean;
}

const DeleteUserModal: React.FC<DeleteModalProps> = ({ user, onClose, onConfirm, isDark }) => {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm(user.id);
    setConfirming(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-sm rounded-xl border shadow-2xl ${
          isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
        }`}
      >
        <div className="p-6">
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isDark ? "bg-rose-500/20" : "bg-rose-50"
          }`}>
            <Trash2 className={`h-6 w-6 ${isDark ? "text-rose-400" : "text-rose-600"}`} />
          </div>
          <h2 className={`mb-2 text-center text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Delete User?
          </h2>
          <p className={`mb-6 text-center text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            Are you sure you want to delete <span className="font-semibold">{user.full_name || user.email}</span>? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                isDark
                  ? "border-white/10 text-gray-300 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirming ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ---- UserTable ----
const UserTable: React.FC<UserTableProps> = ({
  users,
  roles,
  pagination,
  loading,
  actionUserId,
  onPageChange,
  onRoleChange,
  onToggleActive,
  onEditUser,
  onDeleteUser,
  isDark,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.menu-toggle-btn')) {
        return;
      }
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleToggle = (user: AdminUser) => {
    onToggleActive(user);
  };

  return (
    <>
      {editUser && (
        <EditUserModal
          user={editUser}
          roles={roles}
          onClose={() => setEditUser(null)}
          onSave={onEditUser}
          isDark={isDark}
        />
      )}

      {deleteUser && (
        <DeleteUserModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={onDeleteUser}
          isDark={isDark}
        />
      )}

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

                        <div className="relative" ref={menuContainerRef}>
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            className={`menu-toggle-btn inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
                              isDark
                                ? "border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            } ${openMenuId === user.id ? (isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700") : ""}`}
                            aria-label={`Open actions for ${user.full_name}`}
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          <div
                            className={`${openMenuId === user.id ? 'block' : 'hidden'} absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border shadow-lg ${
                              isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
                            }`}
                          >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditUser(user);
                                  setOpenMenuId(null);
                                }}
                                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition first:rounded-t-lg ${
                                  isDark
                                    ? "text-gray-300 hover:bg-white/5 hover:text-white"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <Edit2 size={15} />
                                Edit User
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteUser(user);
                                  setOpenMenuId(null);
                                }}
                                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition last:rounded-b-lg ${
                                  isDark
                                    ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                                    : "text-rose-600 hover:bg-rose-50"
                                }`}
                              >
                                <Trash2 size={15} />
                                Delete User
                              </button>
                            </div>
                        </div>
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
    </>
  );
};

export default UserTable;
