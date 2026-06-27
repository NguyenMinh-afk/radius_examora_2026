import React from "react";
import { Edit, Award } from "lucide-react";

interface TeacherProfileCardProps {
  teacher: {
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    teacherCode?: string | null;
    department?: string | null;
  };
  onEditClick?: () => void;
}

const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({ teacher, onEditClick }) => {
  const initials = teacher.fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
      {/* Avatar */}
      <div className="relative mb-4">
        {teacher.avatarUrl ? (
          <img
            src={teacher.avatarUrl}
            alt={teacher.fullName}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-50"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-50">
            {initials}
          </div>
        )}
        <button
          onClick={onEditClick}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
        >
          <Edit size={14} />
        </button>
      </div>

      {/* Info */}
      <h2 className="text-lg font-bold text-slate-900">{teacher.fullName}</h2>
      {teacher.teacherCode && (
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
          <Award size={14} />
          <span>{teacher.teacherCode}</span>
        </div>
      )}
      {teacher.department && (
        <p className="text-sm text-slate-400 mb-2">{teacher.department}</p>
      )}
      <p className="text-sm text-slate-500 mb-4">{teacher.email}</p>

      <button
        onClick={onEditClick}
        className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 transition"
      >
        Chỉnh sửa hồ sơ
      </button>
    </div>
  );
};

export default TeacherProfileCard;
