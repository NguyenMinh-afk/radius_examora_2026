import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Users, BookOpen, Star, Edit } from "lucide-react";
import type { ClassData } from "../../../api/teacherApi";
import StatusBadge from "../shared/StatusBadge";

interface TeacherClassCardProps {
  classData: ClassData;
  onEdit?: (classData: ClassData) => void;
}

const TeacherClassCard: React.FC<TeacherClassCardProps> = ({ classData, onEdit }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition overflow-hidden">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <GraduationCap size={20} className="text-indigo-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-lg shadow-sm">
              {classData.classCode}
            </span>
            {onEdit && (
              <button
                onClick={() => onEdit(classData)}
                className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-slate-100 transition"
              >
                <Edit size={14} className="text-slate-500" />
              </button>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-slate-900 mt-3 line-clamp-2">{classData.className}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {classData.courseName} · {classData.semester} {classData.academicYear}
        </p>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Users size={12} />
              <span className="text-sm font-bold">{classData.studentCount}</span>
            </div>
            <p className="text-[10px] text-slate-400">Sinh viên</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-indigo-600 mb-1">
              <BookOpen size={12} />
              <span className="text-sm font-bold">{classData.assignmentCount}</span>
            </div>
            <p className="text-[10px] text-slate-400">Bài thi</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Star size={12} />
              <span className="text-sm font-bold">{classData.averageScore.toFixed(1)}</span>
            </div>
            <p className="text-[10px] text-slate-400">Điểm TB</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <StatusBadge status={classData.isActive ? "active" : "inactive"} />
          {classData.openAssignments > 0 && (
            <span className="text-xs text-green-600 font-medium">
              {classData.openAssignments} đang mở
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/teacher/classes/${classData.classId}`}
            className="flex-1 text-center text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition"
          >
            Xem lớp
          </Link>
          <Link
            to={`/teacher/assignments?classId=${classData.classId}`}
            className="flex-1 text-center text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-2 transition"
          >
            Bài thi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherClassCard;
