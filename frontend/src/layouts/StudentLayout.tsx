import React from "react";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { StudentSidebar } from "../components/student/layout";
import { useAuth } from "../hooks/useAuth";
import { Bell, Menu, X } from "lucide-react";
import { useTheme } from "../contexts/useTheme";
import { useMobileSidebar } from "../hooks/useMobileSidebar";

const StudentLayout: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isOpen, close, toggle } = useMobileSidebar();
  const isDark = theme === "dark";

  const initials = (user?.full_name || user?.email || "Học sinh")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("") || "H";

  return (
    <div className={`flex h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar - Hidden on mobile by default, shown when toggled */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:block
        `}
      >
        <StudentSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cohesive Header */}
        <header className={`border-b px-4 lg:px-6 py-3 flex items-center justify-between ${
          isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggle}
              className={`lg:hidden p-2 rounded-lg transition ${
                isDark
                  ? "hover:bg-white/10 text-gray-300"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notifications */}
            <Link
              to="/student/notifications"
              className={`relative p-2 rounded-lg transition ${
                isDark
                  ? "text-gray-400 hover:text-blue-400 hover:bg-white/5"
                  : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Thông báo"
            >
              <Bell size={20} />
            </Link>

            {/* User Pill */}
            <div className={`flex items-center gap-2 sm:gap-3 rounded-full border py-1 pl-1 pr-3 sm:pr-4 ${
              isDark
                ? "border-white/10 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full overflow-hidden bg-blue-600 text-xs sm:text-sm font-bold text-white">
                {user?.avatar_url || user?.avatarUrl ? (
                  <img src={user.avatar_url || user.avatarUrl} alt={user?.full_name || "HS"} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="hidden sm:block">
                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {user?.full_name || "Học sinh"}
                </div>
                <div className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>{user?.email || ""}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
