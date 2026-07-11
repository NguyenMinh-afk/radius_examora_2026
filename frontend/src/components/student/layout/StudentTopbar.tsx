import React from "react";
import { Bell, Settings, User, ChevronDown, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/useTheme";

interface StudentTopbarProps {
  userName?: string;
  userEmail?: string;
  unreadNotifications?: number;
  onLogout?: () => void;
  avatarUrl?: string;
  avatarInitials?: string;
}

const StudentTopbar: React.FC<StudentTopbarProps> = ({
  userName = "Học sinh",
  userEmail = "",
  unreadNotifications = 0,
  onLogout,
  avatarUrl,
  avatarInitials,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
    onLogout?.();
  };

  return (
    <header className={`border-b px-6 py-3 ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className="flex items-center justify-end">
        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link
            to="/student/notifications"
            className={`relative p-2.5 rounded-lg transition ${
              isDark
                ? "text-gray-400 hover:text-blue-400 hover:bg-white/5"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            title="Thông báo"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative group">
            <button className={`flex items-center gap-2.5 p-2 rounded-lg transition ${
              isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
            }`}>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-white leading-none">
                    {avatarInitials || userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className={`text-sm font-medium leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>{userName}</p>
                {userEmail && <p className={`text-xs leading-tight ${isDark ? "text-gray-400" : "text-gray-500"}`}>{userEmail}</p>}
              </div>
              <ChevronDown size={16} className={`hidden md:block ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            </button>

            {/* Dropdown */}
            <div className={`absolute right-0 top-full mt-1 w-52 rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${
              isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
            }`}>
              <div className="p-2">
                <div className={`px-3 py-2 border-b mb-1 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{userName}</p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{userEmail}</p>
                </div>
                <Link
                  to="/student/profile"
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                    isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <User size={16} />
                  Hồ sơ cá nhân
                </Link>
                <Link
                  to="/student/settings"
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                    isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Settings size={16} />
                  Cài đặt
                </Link>
                <hr className={`my-2 ${isDark ? "border-white/10" : "border-slate-100"}`} />
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg w-full ${
                    isDark ? "text-red-400 hover:bg-red-500/20" : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentTopbar;