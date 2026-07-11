import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BellRing,
  BookOpenCheck,
  LibraryBig,
  MessageSquare,
  ScrollText,
  ServerCog,
  LogOut,
  Settings,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { clearAuthData } from "../../../utils/auth";
import { useTheme } from "../../../contexts/useTheme";

const menu = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
  { label: "Users", icon: <Users size={18} />, path: "/admin/users" },
  { label: "Courses", icon: <LibraryBig size={18} />, path: "/admin/courses" },
  { label: "Questions", icon: <BookOpenCheck size={18} />, path: "/admin/questions" },
  { label: "RabbitMQ", icon: <MessageSquare size={18} />, path: "/admin/monitoring" },
  { label: "Notifications", icon: <BellRing size={18} />, path: "/admin/notifications" },
  { label: "Audit Logs", icon: <ScrollText size={18} />, path: "/admin/audit-logs" },
  { label: "System Logs", icon: <ServerCog size={18} />, path: "/admin/system-logs" },
];

const bottomMenu = [
  { label: "Profile", icon: <User size={18} />, path: "/admin/profile" },
  { label: "Settings", icon: <Settings size={18} />, path: "/admin/settings" },
];

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuthData();
    navigate("/login");
  };

  return (
    <aside className={`w-64 h-screen sticky top-0 flex flex-col ${
      isDark ? "bg-slate-900 border-r border-white/10" : "bg-white border-r border-slate-200"
    }`}>
      {/* Logo + Theme Toggle */}
      <div className={`px-6 py-5 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
        <div className="flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 flex items-center justify-center shadow-md">
              <div
                className="w-4 h-4 bg-white"
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
              />
            </div>
            <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>EXMORA</span>
          </Link>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition ${
              isDark ? "hover:bg-slate-800 text-gray-400" : "hover:bg-slate-100 text-slate-600"
            }`}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
          </button>
        </div>
        <span className={`text-xs font-medium ml-11 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Admin Panel</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-3 py-4">
        {menu.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition ${
              location.pathname === item.path
                ? isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-700"
                : isDark ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-slate-50 hover:text-blue-700"
            } text-left`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className={`px-3 py-4 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
        <div className="space-y-1">
          {bottomMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                location.pathname === item.path
                  ? isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-700"
                  : isDark ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              isDark
                ? "text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                : "text-gray-600 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
