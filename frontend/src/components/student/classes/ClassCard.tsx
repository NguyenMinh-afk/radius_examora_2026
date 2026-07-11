import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, TrendingUp } from "lucide-react";
import type { ClassData } from "../../../api/studentApi";
import { useTheme } from "../../../contexts/useTheme";

interface ClassCardProps {
  classData: ClassData;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      {/* Card Header */}
      <div className={`p-5 border-b ${
        isDark
          ? "border-white/10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"
          : "border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50"
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{classData.className}</h3>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mã lớp: {classData.classCode}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            classData.isActive
              ? isDark
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-green-100 text-green-700"
              : isDark
              ? "bg-white/5 text-gray-400"
              : "bg-gray-100 text-gray-700"
          }`}>
            {classData.isActive ? "Đang hoạt động" : "Không hoạt động"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <div className="space-y-3 mb-4">
          <div>
            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Môn học</p>
            <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{classData.courseName || "Chưa có môn"}</p>
          </div>
          <div>
            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Giảng viên</p>
            <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{classData.teacherName || "N/A"}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Học kỳ</p>
              <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{classData.semester || "N/A"}</p>
            </div>
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Năm học</p>
              <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{classData.academicYear || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg ${
          isDark ? "bg-white/5" : "bg-slate-50"
        }`}>
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1 mb-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              <BookOpen size={14} />
              <span className="text-lg font-bold">{classData.stats?.totalAssignments || 0}</span>
            </div>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tổng bài</p>
          </div>
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1 mb-1 ${isDark ? "text-emerald-400" : "text-green-600"}`}>
              <FileText size={14} />
              <span className="text-lg font-bold">{classData.stats?.completedAssignments || 0}</span>
            </div>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Hoàn thành</p>
          </div>
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1 mb-1 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              <TrendingUp size={14} />
              <span className="text-lg font-bold">{classData.stats?.averageScore || 0}</span>
            </div>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Điểm TB</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/student/classes/${classData.classId}`}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition text-center"
          >
            Xem lớp
          </Link>
          <Link
            to={`/student/assignments?classId=${classData.classId}`}
            className={`flex-1 px-4 py-2 border text-sm font-medium rounded-lg transition text-center ${
              isDark
                ? "border-white/10 text-gray-300 hover:bg-white/5"
                : "border-slate-200 text-gray-700 hover:bg-slate-50"
            }`}
          >
            Bài thi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;