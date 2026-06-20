import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BellRing,
  LibraryBig,
  MessageSquare,
  ScrollText,
  ServerCog,
  LogOut,
} from "lucide-react";
import { clearAuthData } from "../../utils/auth";

export type AdminSection =
  | "users"
  | "courses"
  | "monitoring"
  | "notifications"
  | "auditLogs"
  | "systemLogs";

const menu = [
  { id: "users", label: "Users", icon: <Users size={18} /> },
  { id: "courses", label: "Courses", icon: <LibraryBig size={18} /> },
  { id: "monitoring", label: "RabbitMQ", icon: <MessageSquare size={18} /> },
  { id: "notifications", label: "Notifications", icon: <BellRing size={18} /> },
  { id: "auditLogs", label: "Audit Logs", icon: <ScrollText size={18} /> },
  { id: "systemLogs", label: "System Logs", icon: <ServerCog size={18} /> },
];

interface AdminSidebarProps {
  activeSection?: AdminSection;
  onSectionChange?: (section: AdminSection) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection = "users",
  onSectionChange,
}) => {
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuthData();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col px-6 py-8">
      {/* Logo */}
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight">
          EXMORA
        </h2>
        <span className="text-xs text-gray-400 font-medium">Admin Panel</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {menu.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.id) {
                onSectionChange?.(item.id as AdminSection);
              }
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition
              ${
                item.id === activeSection
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-slate-50 hover:text-blue-700"
              } text-left`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            System Status
          </h3>
          <div className="space-y-2 text-xs font-medium text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <span>RabbitMQ</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>AI Service</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Running
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Database</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Online
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
          <a
            href="#"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium hover:bg-slate-50 hover:text-blue-700 transition"
          >
            <LogOut size={18} />
            Logout
          </a>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
