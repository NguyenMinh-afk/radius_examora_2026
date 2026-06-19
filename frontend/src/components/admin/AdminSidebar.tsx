import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  LibraryBig,
  MessageSquare,
  Cpu,
  BookOpen,
  Sparkles,
  FileText,
  Settings,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { clearAuthData } from "../../utils/auth";

export type AdminSection = "users" | "courses";

const menu = [
  { label: "System", icon: <LayoutGrid size={18} /> },
  { id: "users", label: "Users", icon: <Users size={18} /> },
  { id: "courses", label: "Courses", icon: <LibraryBig size={18} /> },
  { label: "RabbitMQ", icon: <MessageSquare size={18} /> },
  { label: "AI Models", icon: <Cpu size={18} /> },
  { label: "Question Bank", icon: <BookOpen size={18} /> },
  { label: "AI Generator", icon: <Sparkles size={18} /> },
  { label: "Exams", icon: <FileText size={18} /> },
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

      {/* Bottom section */}
      <div className="mt-8">
        {/* Pro Access box */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-600 tracking-wide mb-3">
            PRO ACCESS
          </h3>
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 transition">
            <ArrowUpRight size={16} />
            Upgrade to Pro
          </button>
        </div>

        {/* Settings & Logout */}
        <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium hover:bg-slate-50 hover:text-blue-700 transition"
          >
            <Settings size={18} />
            Settings
          </a>

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
