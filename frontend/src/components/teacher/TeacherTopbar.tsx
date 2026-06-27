import React from "react";
import { Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface TeacherTopbarProps {
  userName?: string;
  userEmail?: string;
  unreadNotifications?: number;
  avatarUrl?: string;
  avatarInitials?: string;
  onLogout?: () => void;
}

const TeacherTopbar: React.FC<TeacherTopbarProps> = ({
  userName = "Giảng viên",
  userEmail = "",
  unreadNotifications = 0,
  avatarUrl,
  avatarInitials,
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
    onLogout?.();
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link
            to="/teacher/notifications"
            className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
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
            <button className="flex items-center gap-2.5 p-2 hover:bg-gray-50 rounded-lg transition">
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
                <p className="text-sm font-medium text-gray-900 leading-tight">{userName}</p>
                {userEmail && <p className="text-xs text-gray-500 leading-tight">{userEmail}</p>}
              </div>
              <ChevronDown size={16} className="text-gray-400 hidden md:block" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <Link
                  to="/teacher/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <User size={16} />
                  Hồ sơ cá nhân
                </Link>
                <Link
                  to="/teacher/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Settings size={16} />
                  Cài đặt
                </Link>
                <hr className="my-2 border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full"
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

export default TeacherTopbar;
