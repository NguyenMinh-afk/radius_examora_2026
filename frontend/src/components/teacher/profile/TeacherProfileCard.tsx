import React from "react";
import { Award } from "lucide-react";

interface TeacherProfileCardProps {
  teacher: {
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    teacherCode?: string | null;
    department?: string | null;
  };
  isDark?: boolean;
}

const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({ teacher, isDark }) => {
  const initials = teacher.fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <div className={`rounded-2xl border shadow-sm p-6 flex flex-col items-center text-center ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className="relative mb-4">
        {teacher.avatarUrl ? (
          <img
            src={teacher.avatarUrl}
            alt={teacher.fullName}
            className={`w-24 h-24 rounded-full object-cover border-4 ${
              isDark ? "border-blue-500/30" : "border-blue-50"
            }`}
          />
        ) : (
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 ${
            isDark ? "border-blue-500/30" : "border-blue-50"
          }`}>
            {initials}
          </div>
        )}
      </div>

      <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{teacher.fullName}</h2>
      {teacher.teacherCode && (
        <div className={`flex items-center gap-1.5 text-sm mb-2 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
          <Award size={14} />
          <span>{teacher.teacherCode}</span>
        </div>
      )}
      {teacher.department && (
        <p className={`text-sm mb-2 ${isDark ? "text-gray-500" : "text-slate-400"}`}>{teacher.department}</p>
      )}
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>{teacher.email}</p>
    </div>
  );
};

export default TeacherProfileCard;
