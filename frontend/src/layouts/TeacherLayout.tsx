import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import { useAuth } from "../hooks/useAuth";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

const TeacherLayout: React.FC = () => {
  const { user } = useAuth();

  const initials = (user?.full_name || user?.email || "GV")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("") || "GV";

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cohesive Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Spacer for alignment */}
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link
              to="/teacher/notifications"
              className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Thông báo"
            >
              <Bell size={20} />
            </Link>

            {/* User Pill */}
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {initials}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">
                  {user?.full_name || "Giảng viên"}
                </div>
                <div className="text-xs text-slate-500">{user?.email || ""}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
