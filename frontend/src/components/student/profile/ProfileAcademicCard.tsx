import React from "react";
import { GraduationCap, BookOpen, Award } from "lucide-react";

interface ProfileAcademicCardProps {
  studentCode?: string;
  className?: string;
  yearLevel?: string;
  semester?: string;
  academicYear?: string;
}

const ProfileAcademicCard: React.FC<ProfileAcademicCardProps> = ({
  studentCode,
  yearLevel,
  semester,
  academicYear,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <GraduationCap size={18} className="text-blue-600" />
        Thông tin học tập
      </h3>
      <div className="space-y-4">
        {studentCode && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Mã sinh viên</p>
              <p className="text-sm font-medium text-gray-900">{studentCode}</p>
            </div>
          </div>
        )}
        {yearLevel && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Award size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Năm học</p>
              <p className="text-sm font-medium text-gray-900">{yearLevel}</p>
            </div>
          </div>
        )}
        {(semester || academicYear) && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <GraduationCap size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Học kỳ / Năm học</p>
              <p className="text-sm font-medium text-gray-900">
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
