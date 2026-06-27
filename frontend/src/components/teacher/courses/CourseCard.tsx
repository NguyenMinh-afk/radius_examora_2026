import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, FileText, HelpCircle, Edit, Trash2 } from "lucide-react";
import type { Course } from "../../../api/teacherApi";

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
          <BookOpen size={22} className="text-blue-600" />
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
          {course.code}
        </span>
      </div>

      {/* Info */}
      <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition">
        {course.name}
      </h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
        {course.description || "Chưa có mô tả"}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
            <Users size={12} />
            <span className="text-sm font-bold">{course.classCount}</span>
          </div>
          <p className="text-[10px] text-slate-400">Lớp</p>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-indigo-600 mb-1">
            <FileText size={12} />
            <span className="text-sm font-bold">{course.examCount}</span>
          </div>
          <p className="text-[10px] text-slate-400">Đề</p>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
            <HelpCircle size={12} />
            <span className="text-sm font-bold">{course.questionCount}</span>
          </div>
          <p className="text-[10px] text-slate-400">Câu</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
        <span>{course.credits} tín chỉ</span>
        <span>·</span>
        <span>{course.facultyName}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/teacher/courses/${course.courseId}`}
          className="flex-1 text-center text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition"
        >
          Chi tiết
        </Link>
        {onEdit && (
          <button
            onClick={() => onEdit(course)}
            className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Edit size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(course)}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
