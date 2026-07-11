import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, CheckCircle, Eye, Edit, Trash2, RotateCcw, XCircle } from "lucide-react";
import type { Assignment } from "../../../api/teacherApi";
import AssignmentStatusBadge from "./AssignmentStatusBadge";

interface TeacherAssignmentCardProps {
  assignment: Assignment;
  onClose?: (id: string) => void;
  onReopen?: (id: string) => void;
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (id: string) => void;
  isDark?: boolean;
}

const formatDateTime = (d: string) =>
  new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

const TeacherAssignmentCard: React.FC<TeacherAssignmentCardProps> = ({
  assignment,
  onClose,
  onReopen,
  onEdit,
  onDelete,
  isDark,
}) => {
  const progressPercent = assignment.studentAssigned > 0
    ? Math.round((assignment.submitted / assignment.studentAssigned) * 100)
    : 0;

  const gradePercent = assignment.submitted > 0
    ? Math.round((assignment.graded / assignment.submitted) * 100)
    : 0;

  return (
    <div className={`rounded-xl border shadow-sm p-5 transition group ${
      isDark
        ? "bg-slate-900 border-white/10 hover:border-blue-500/40"
        : "bg-white border-slate-200 hover:border-blue-200"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{assignment.title}</h3>
            <AssignmentStatusBadge status={assignment.status} isDark={isDark} />
          </div>

          <p className={`text-xs mb-3 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            {assignment.className} · {assignment.examName}
          </p>

          <div className={`flex items-center gap-1 text-xs mb-3 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
            <Clock size={12} />
            {formatDateTime(assignment.startTime)} - {formatDateTime(assignment.endTime)}
          </div>

          <div className={`flex items-center gap-4 text-xs mb-3 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {assignment.studentAssigned} SV
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={12} className={isDark ? "text-emerald-400" : "text-green-500"} />
              {assignment.submitted} đã nộp
            </span>
            <span className="flex items-center gap-1">
              {assignment.graded > 0 ? (
                <CheckCircle size={12} className={isDark ? "text-emerald-400" : "text-green-500"} />
              ) : (
                <XCircle size={12} className={isDark ? "text-amber-400" : "text-amber-500"} />
              )}
              {assignment.graded}/{assignment.submitted} đã chấm
            </span>
            <span className="flex items-center gap-1">
              Max: {assignment.maxAttempts} lần
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] w-16 ${isDark ? "text-gray-500" : "text-slate-400"}`}>Nộp bài</span>
              <div className={`flex-1 rounded-full h-1.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className={`text-[10px] w-8 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{progressPercent}%</span>
            </div>
            {assignment.submitted > 0 && (
              <div className="flex items-center gap-2">
                <span className={`text-[10px] w-16 ${isDark ? "text-gray-500" : "text-slate-400"}`}>Chấm điểm</span>
                <div className={`flex-1 rounded-full h-1.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${gradePercent}%` }}
                  />
                </div>
                <span className={`text-[10px] w-8 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{gradePercent}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
          {onEdit && (
            <button
              onClick={() => onEdit(assignment)}
              className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition ${
                isDark
                  ? "text-gray-300 bg-white/5 hover:bg-white/10"
                  : "text-slate-600 bg-slate-100 hover:bg-slate-200"
              }`}
            >
              <Edit size={12} />
              Sửa
            </button>
          )}
          {assignment.status === "open" && onClose && (
            <button
              onClick={() => onClose(assignment.assignmentId)}
              className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition ${
                isDark
                  ? "text-red-400 bg-red-500/20 hover:bg-red-500/30"
                  : "text-red-600 bg-red-50 hover:bg-red-100"
              }`}
            >
              <XCircle size={12} />
              Đóng bài
            </button>
          )}
          {assignment.status === "closed" && onReopen && (
            <button
              onClick={() => onReopen(assignment.assignmentId)}
              className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition ${
                isDark
                  ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30"
                  : "text-blue-600 bg-blue-50 hover:bg-blue-100"
              }`}
            >
              <RotateCcw size={12} />
              Mở lại
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(assignment.assignmentId)}
              className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition ${
                isDark
                  ? "text-red-400 bg-red-500/20 hover:bg-red-500/30"
                  : "text-red-600 bg-red-50 hover:bg-red-100"
              }`}
            >
              <Trash2 size={12} />
              Xóa
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to={`/teacher/results?assignmentId=${assignment.assignmentId}`}
            className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition ${
              isDark
                ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30"
                : "text-blue-600 bg-blue-50 hover:bg-blue-100"
            }`}
          >
            <Eye size={12} />
            Xem kết quả
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignmentCard;
