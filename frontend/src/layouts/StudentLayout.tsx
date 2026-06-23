import React from "react";
import { Outlet } from "react-router-dom";
import { StudentSidebar, StudentTopbar } from "../components/student/layout";
import { useAuth } from "../hooks/useAuth";

const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();

  const initials = (user?.full_name || user?.email || "Học sinh")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("") || "H";

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <StudentTopbar
          userName={user?.full_name || user?.email || "Học sinh"}
          userEmail={user?.email || ""}
          avatarUrl={user?.avatar_url}
          avatarInitials={initials}
          onLogout={logout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
