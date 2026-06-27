import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import TeacherTopbar from "../components/teacher/TeacherTopbar";
import { useAuth } from "../hooks/useAuth";

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
        {/* Topbar */}
        <TeacherTopbar
          userName={user?.full_name || user?.email || "Giảng viên"}
          userEmail={user?.email || ""}
          avatarUrl={user?.avatar_url}
          avatarInitials={initials}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
