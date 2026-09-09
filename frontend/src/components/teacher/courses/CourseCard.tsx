import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, FileText, HelpCircle, Edit, Trash2 } from "lucide-react";
import type { Course } from "../../../api/teacherApi";

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  isDark?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete, isDark }) => {
  return (
    <div className={`rounded-2xl border shadow-sm p-6 transition group ${
      isDark
        ? "bg-slate-900 border-white/10 hover:border-blue-500/40 hover:shadow-md"
        : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-md"
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
          isDark ? "bg-blue-500/20 group-hover:bg-blue-500/30" : "bg-blue-50 group-hover:bg-blue-100"
        }`}>
          <BookOpen size={22} className={isDark ? "text-blue-400" : "text-blue-600"} />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
          isDark ? "text-gray-400 bg-white/5" : "text-slate-400 bg-slate-100"
        }`}>
          {course.code}
        </span>
      </div>

      <h3 className={`text-base font-bold mb-1 transition group-hover:text-blue-500 ${
        isDark ? "text-white" : "text-slate-900"
      }`}>
        {course.name}
      </h3>
      <p className={`text-sm mb-4 line-clamp-2 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
        {course.description || "Chưa có mô tả"}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`text-center p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <div className={`flex items-center justify-center gap-1 mb-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
            <Users size={12} />
            <span className="text-sm font-bold">{course.classCount}</span>
          </div>
          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Lớp</p>
        </div>
        <div className={`text-center p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <div className={`flex items-center justify-center gap-1 mb-1 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
            <FileText size={12} />
            <span className="text-sm font-bold">{course.examCount}</span>
          </div>
          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Đề</p>
        </div>
        <div className={`text-center p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <div className={`flex items-center justify-center gap-1 mb-1 ${isDark ? "text-purple-400" : "text-purple-600"}`}>
            <HelpCircle size={12} />
            <span className="text-sm font-bold">{course.questionCount}</span>
          </div>
          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Câu</p>
        </div>
      </div>

      <div className={`flex items-center gap-3 text-xs mb-4 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
        <span>{course.credits} tín chỉ</span>
        <span>·</span>
        <span>{course.facultyName}</span>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/teacher/courses/${course.courseId}`}
          className={`flex-1 text-center text-sm font-medium rounded-lg py-2 transition ${
            isDark ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30" : "text-blue-600 bg-blue-50 hover:bg-blue-100"
          }`}
        >
          Chi tiết
        </Link>
        {onEdit && (
          <button
            onClick={() => onEdit(course)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
              isDark
                ? "text-gray-300 bg-white/5 hover:bg-white/10"
                : "text-slate-600 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            <Edit size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(course)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
              isDark
                ? "text-red-400 bg-red-500/20 hover:bg-red-500/30"
                : "text-red-600 bg-red-50 hover:bg-red-100"
            }`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
