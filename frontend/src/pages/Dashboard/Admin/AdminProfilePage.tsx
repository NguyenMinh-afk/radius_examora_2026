import React, { useMemo } from "react";
import { Award, Mail, Shield, User } from "lucide-react";
import AdminSidebar from "../../../components/admin/layout/AdminSidebar";
import { getCurrentUser } from "../../../utils/auth";
import { useTheme } from "../../../contexts/useTheme";

const AdminProfilePage: React.FC = () => {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const initials = currentUser?.full_name
    ? currentUser.full_name
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((p) => p.charAt(0).toUpperCase())
        .join("")
    : "A";

  return (
    <div className={`flex min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <AdminSidebar />

      <main className={`flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-7 ${isDark ? "text-white" : "text-slate-900"}`}>
        <div className="mb-8">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>Admin Profile</h1>
          <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>View your admin account information</p>
        </div>

        <div className="max-w-2xl">
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
          }`}>
            {/* Avatar */}
            <div className={`flex flex-col items-center pb-6 mb-6 border-b ${
              isDark ? "border-white/10" : "border-slate-100"
            }`}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-50 mb-4">
                {initials}
              </div>
              <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {currentUser?.full_name || "Admin"}
              </h2>
              <div className={`flex items-center gap-1.5 mt-1 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                <Shield size={14} />
                <span>Administrator</span>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                  isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
                }`}>
                  <User size={18} className={isDark ? "text-gray-400" : "text-slate-500"} />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>Full Name</p>
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                    {currentUser?.full_name || "N/A"}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                  isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
                }`}>
                  <Mail size={18} className={isDark ? "text-gray-400" : "text-slate-500"} />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>Email</p>
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{currentUser?.email || "N/A"}</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                  isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
                }`}>
                  <Award size={18} className={isDark ? "text-gray-400" : "text-slate-500"} />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-slate-400"}`}>Role</p>
                  <p className={`text-sm font-medium capitalize ${isDark ? "text-white" : "text-slate-900"}`}>
                    {currentUser?.role || "admin"}
                  </p>
                </div>
              </div>
            </div>

            <div className={`mt-6 pt-6 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <p className={`text-xs text-center ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                To update your profile information, please go to{" "}
                <a href="/admin/settings" className={`font-medium ${
                  isDark ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline"
                }`}>
                  Settings
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfilePage;
