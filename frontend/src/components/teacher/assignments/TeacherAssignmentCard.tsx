import React from "react";
import { Clock, Users, CheckCircle, XCircle } from "lucide-react";
import type { Assignment } from "../../../api/teacherApi";
import AssignmentStatusBadge from "./AssignmentStatusBadge";

interface TeacherAssignmentCardProps {
  assignment: Assignment;
  onClose?: (id: string) => void;
}

const formatDateTime = (d: string) =>
  new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

const TeacherAssignmentCard: React.FC<TeacherAssignmentCardProps> = ({ assignment, onClose }) => {
  const progressPercent = assignment.studentAssigned > 0
    ? Math.round((assignment.submitted / assignment.studentAssigned) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-blue-200 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900">{assignment.title}</h3>
            <AssignmentStatusBadge status={assignment.status} />
          </div>

          {/* Meta */}
          <p className="text-xs text-slate-500 mb-3">
            {assignment.className} · {assignment.examName}
          </p>

          {/* Time */}
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
            <Clock size={12} />
            {formatDateTime(assignment.startTime)} - {formatDateTime(assignment.endTime)}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {assignment.studentAssigned} SV
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={12} className="text-green-500" />
              {assignment.submitted} đã nộp
            </span>
            <span className="flex items-center gap-1">
              {assignment.graded > 0 ? (
                <CheckCircle size={12} className="text-green-500" />
              ) : (
                <XCircle size={12} className="text-amber-500" />
              )}
              {assignment.graded} đã chấm
            </span>
            <span className="flex items-center gap-1">
              Max: {assignment.maxAttempts} lần
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {assignment.status === "open" && onClose && (
            <button
              onClick={() => onClose(assignment.assignmentId)}
              className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 transition"
            >
              Đóng bài
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignmentCard;
