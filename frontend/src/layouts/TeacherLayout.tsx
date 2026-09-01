import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import { useAuth } from "../hooks/useAuth";
import { Bell, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/useTheme";

const TeacherLayout: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initials = (user?.full_name || user?.email || "GV")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("") || "GV";

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={`flex h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className={`absolute inset-0 ${isDark ? "bg-slate-900/95" : "bg-white/95"} backdrop-blur-lg`} onClick={closeMobileMenu} />
          <div className={`relative w-64 h-full ${isDark ? "bg-slate-900" : "bg-white"} border-r ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <button
              onClick={closeMobileMenu}
              className={`absolute top-4 right-4 p-2 rounded-lg ${isDark ? "text-gray-400 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <X size={20} />
            </button>
            <TeacherSidebar />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <TeacherSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cohesive Header */}
        <header className={`px-4 md:px-6 py-3 flex items-center justify-between border-b ${
          isDark
            ? "bg-slate-900 border-white/10"
            : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className={`md:hidden p-2 rounded-lg ${isDark ? "text-gray-400 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <Link
              to="/teacher/notifications"
              className={`relative p-2.5 rounded-lg transition ${
                isDark
                  ? "text-gray-400 hover:text-blue-400 hover:bg-blue-500/20"
                  : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Thông báo"
            >
              <Bell size={20} />
            </Link>

            {/* User Pill */}
            <div className={`flex items-center gap-2 md:gap-3 rounded-full border py-1 pl-1 pr-3 md:pr-4 ${
              isDark
                ? "border-white/10 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}>
              <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full overflow-hidden bg-blue-600 text-xs md:text-sm font-bold text-white">
                {user?.avatar_url || user?.avatarUrl ? (
                  <img src={user.avatar_url || user.avatarUrl} alt={user?.full_name || "GV"} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="hidden sm:block">
                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {user?.full_name || "Giảng viên"}
                </div>
                <div className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>{user?.email || ""}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 ${isDark ? "text-white" : "text-slate-900"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
