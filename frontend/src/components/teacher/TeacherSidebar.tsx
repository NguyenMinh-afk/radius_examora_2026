import React from "react";
import { Link, useLocation } from "react-router-dom";
import { clearAuthData } from "../../utils/auth";
import {
  LayoutGrid,
  BookOpen,
  GraduationCap,
  HelpCircle,
  FileText,
  ClipboardList,
  CalendarClock,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const menu = [
  { label: "Trang chủ", icon: <LayoutGrid size={18} />, path: "/teacher" },
  { label: "Khóa học", icon: <BookOpen size={18} />, path: "/teacher/courses" },
  { label: "Lớp học", icon: <GraduationCap size={18} />, path: "/teacher/classes" },
  { label: "Ngân hàng câu hỏi", icon: <HelpCircle size={18} />, path: "/teacher/questions" },
  { label: "Đề thi", icon: <FileText size={18} />, path: "/teacher/exams" },
  { label: "Bài thi đã giao", icon: <ClipboardList size={18} />, path: "/teacher/assignments" },
  { label: "Lịch thi", icon: <CalendarClock size={18} />, path: "/teacher/schedule" },
  { label: "Kết quả", icon: <BarChart3 size={18} />, path: "/teacher/results" },
  { label: "Thông báo", icon: <Bell size={18} />, path: "/teacher/notifications" },
];

const bottomMenu = [
  { label: "Hồ sơ", icon: <User size={18} />, path: "/teacher/profile" },
  { label: "Cài đặt", icon: <Settings size={18} />, path: "/teacher/settings" },
];

const TeacherSidebar: React.FC = () => {
  const location = useLocation();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuthData();
    window.location.href = "/login";
  };

  const isActive = (path: string) => {
    if (path === "/teacher") {
      return location.pathname === "/teacher" || location.pathname === "/teacher/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link to="/teacher" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 flex items-center justify-center shadow-md">
            <div
              className="w-4 h-4 bg-white"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            />
          </div>
          <span className="text-xl font-bold text-gray-900">EXMORA</span>
        </Link>
        <span className="text-xs text-gray-400 font-medium ml-11">Teacher Panel</span>
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
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
