import React from "react";
import { GraduationCap, BookOpen, Award } from "lucide-react";
import { useTheme } from "../../../contexts/useTheme";

interface ProfileAcademicCardProps {
  studentCode?: string | null;
  className?: string;
  yearLevel?: string | null;
  semester?: string | null;
  academicYear?: string | null;
}

const ProfileAcademicCard: React.FC<ProfileAcademicCardProps> = ({
  studentCode,
  yearLevel,
  semester,
  academicYear,
  className = ""
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl shadow-sm border p-5 ${className} ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
        <GraduationCap size={18} className={isDark ? "text-blue-400" : "text-blue-600"} />
        Thông tin học tập
      </h3>
      <div className="space-y-4">
        {studentCode && (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
              <BookOpen size={18} className={isDark ? "text-blue-400" : "text-blue-600"} />
            </div>
            <div>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mã sinh viên</p>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{studentCode}</p>
            </div>
          </div>
        )}
        {yearLevel && (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
              <Award size={18} className={isDark ? "text-blue-400" : "text-blue-600"} />
            </div>
            <div>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Năm học</p>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{yearLevel}</p>
            </div>
          </div>
        )}
        {(semester || academicYear) && (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
              <GraduationCap size={18} className={isDark ? "text-blue-400" : "text-blue-600"} />
            </div>
            <div>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Học kỳ / Năm học</p>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                {[semester, academicYear].filter(Boolean).join(" - ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAcademicCard;