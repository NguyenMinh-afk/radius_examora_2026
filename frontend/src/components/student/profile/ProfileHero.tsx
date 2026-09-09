import React from "react";
import { User } from "lucide-react";
import { useTheme } from "../../../contexts/useTheme";

interface ProfileHeroProps {
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  studentCode?: string | null;
  className?: string;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({ fullName, email, avatarUrl, studentCode, className = "" }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-2xl p-8 ${className} ${
      isDark
        ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white"
        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
    }`}>
      <div className="flex items-center gap-6">
        <div className={`w-24 h-24 ${isDark ? "bg-slate-700" : "bg-white/20"} rounded-full flex items-center justify-center`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={48} className={isDark ? "text-slate-400" : "text-white/80"} />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
          <p className={isDark ? "text-gray-400" : "text-blue-100"}>{email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 ${isDark ? "bg-slate-700" : "bg-white/20"} rounded-full text-sm`}>
              Sinh viên
            </span>
            {studentCode && (
              <span className={`inline-flex items-center px-3 py-1 ${isDark ? "bg-emerald-500/30 text-emerald-300" : "bg-green-500/30"} rounded-full text-sm`}>
                MS: {studentCode}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;