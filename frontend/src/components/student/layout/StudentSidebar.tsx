import React from "react";
import { Link, useLocation } from "react-router-dom";
import { clearAuthData } from "../../../utils/auth";
import {
  LayoutGrid,
  GraduationCap,
  FileText,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  User,
  HelpCircle,
} from "lucide-react";

const menu = [
  { label: "Home", icon: <LayoutGrid size={18} />, path: "/student" },
  { label: "Classes", icon: <GraduationCap size={18} />, path: "/student/classes" },
  { label: "Assignments", icon: <FileText size={18} />, path: "/student/assignments" },
  { label: "Results", icon: <BookOpen size={18} />, path: "/student/results" },
  { label: "Notifications", icon: <Bell size={18} />, path: "/student/notifications" },
  { label: "Profile", icon: <User size={18} />, path: "/student/profile" },
];

const bottomMenu = [
  { label: "Settings", icon: <Settings size={18} />, path: "/student/settings" },
  { label: "Help Center", icon: <HelpCircle size={18} />, path: "/help" },
];

const StudentSidebar: React.FC = () => {
  const location = useLocation();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuthData();
    window.location.href = "/login";
  };

  const isActive = (path: string) => {
    if (path === "/student") {
      return location.pathname === "/student" || location.pathname === "/student/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link to="/student" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 flex items-center justify-center shadow-md">
            <div
              className="w-4 h-4 bg-white"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            />
          </div>
          <span className="text-xl font-bold text-gray-900">EXMORA</span>
        </Link>
        <span className="text-xs text-gray-400 font-medium ml-11">Student Panel</span>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2"
                    : "text-gray-600 hover:bg-slate-50 hover:text-blue-700"
                }`}
            >
              <span className={isActive(item.path) ? "text-blue-600" : ""}>{item.icon}</span>
              {item.label}
              {isActive(item.path) && (
                <ChevronRight size={16} className="ml-auto text-blue-400" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="space-y-1">
          {bottomMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-slate-50 hover:text-blue-700"
                }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
