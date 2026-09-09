import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Users, BookOpen, Star, Edit } from "lucide-react";
import type { ClassData } from "../../../api/teacherApi";
import StatusBadge from "../shared/StatusBadge";

interface TeacherClassCardProps {
  classData: ClassData;
  onEdit?: (classData: ClassData) => void;
  isDark?: boolean;
}

const TeacherClassCard: React.FC<TeacherClassCardProps> = ({ classData, onEdit, isDark }) => {
  return (
    <div className={`rounded-2xl border shadow-sm transition overflow-hidden ${
      isDark
        ? "bg-slate-900 border-white/10 hover:border-blue-500/40 hover:shadow-md"
        : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-md"
    }`}>
      <div className={`p-5 border-b ${
        isDark
          ? "border-white/10 bg-gradient-to-r from-indigo-500/20 to-blue-500/20"
          : "border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50"
      }`}>
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
            isDark ? "bg-slate-800" : "bg-white"
          }`}>
            <GraduationCap size={20} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-lg shadow-sm ${
              isDark ? "text-gray-300 bg-slate-800" : "text-slate-400 bg-white"
            }`}>
              {classData.classCode}
            </span>
            {onEdit && (
              <button
                onClick={() => onEdit(classData)}
                className={`p-1.5 rounded-lg shadow-sm transition ${
                  isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-slate-100"
                }`}
              >
                <Edit size={14} className={isDark ? "text-gray-400" : "text-slate-500"} />
              </button>
            )}
          </div>
        </div>
        <h3 className={`font-semibold mt-3 line-clamp-2 ${isDark ? "text-white" : "text-slate-900"}`}>{classData.className}</h3>
        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
          {classData.courseName} · {classData.semester} {classData.academicYear}
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`text-center p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <div className={`flex items-center justify-center gap-1 mb-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              <Users size={12} />
              <span className="text-sm font-bold">{classData.studentCount}</span>
            </div>
            <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Sinh viên</p>
          </div>
          <div className={`text-center p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <div className={`flex items-center justify-center gap-1 mb-1 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
              <BookOpen size={12} />
              <span className="text-sm font-bold">{classData.assignmentCount}</span>
            </div>
            <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Bài thi</p>
          </div>
          <div className={`text-center p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <div className={`flex items-center justify-center gap-1 mb-1 ${isDark ? "text-amber-400" : "text-amber-500"}`}>
              <Star size={12} />
              <span className="text-sm font-bold">{classData.averageScore.toFixed(1)}</span>
            </div>
            <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Điểm TB</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <StatusBadge status={classData.isActive ? "active" : "inactive"} isDark={isDark} />
          {classData.openAssignments > 0 && (
            <span className={`text-xs font-medium ${isDark ? "text-emerald-400" : "text-green-600"}`}>
              {classData.openAssignments} đang mở
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            to={`/teacher/classes/${classData.classId}`}
            className={`flex-1 text-center text-sm font-medium rounded-lg py-2 transition ${
              isDark ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30" : "text-blue-600 bg-blue-50 hover:bg-blue-100"
            }`}
          >
            Xem lớp
          </Link>
          <Link
            to={`/teacher/assignments?classId=${classData.classId}`}
            className={`flex-1 text-center text-sm font-medium rounded-lg py-2 transition ${
              isDark ? "text-indigo-400 bg-indigo-500/20 hover:bg-indigo-500/30" : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
            }`}
          >
            Bài thi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherClassCard;
