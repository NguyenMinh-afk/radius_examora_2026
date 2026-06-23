import React from "react";
import { Link } from "react-router-dom";
import type { Assignment } from "../../../api/studentApi";
import AssignmentStatusBadge from "./AssignmentStatusBadge";

interface AssignmentCardProps {
  assignment: Assignment;
}

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{assignment.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {assignment.courseName} • {assignment.className}
          </p>
          <p className="text-xs text-gray-400">GV: {assignment.teacherName}</p>
        </div>
        <AssignmentStatusBadge status={assignment.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-400">Mở lúc</p>
          <p className="font-medium text-gray-700">{formatDateTime(assignment.startTime)}</p>
        </div>
        <div>
          <p className="text-gray-400">Đóng lúc</p>
          <p className="font-medium text-gray-700">{formatDateTime(assignment.endTime)}</p>
        </div>
        <div>
          <p className="text-gray-400">Thời lượng</p>
          <p className="font-medium text-gray-700">{assignment.duration || 60} phút</p>
        </div>
        <div>
          <p className="text-gray-400">Số lần làm</p>
          <p className="font-medium text-gray-700">{assignment.attemptsUsed}/{assignment.maxAttempts}</p>
        </div>
      </div>

      {assignment.latestAttempt && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-sm text-green-700">
            <strong>Điểm: {assignment.latestAttempt.score ?? "-"}</strong> ({assignment.latestAttempt.percentage ?? 0}%)
            {" | "}Nộp: {formatDateTime(assignment.latestAttempt.submittedAt)}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {assignment.status === "open" && (
          <Link
            to={`/student/assignments/${assignment.assignmentId}/start`}
            className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
          >
            Vào thi
          </Link>
        )}
        {assignment.status === "upcoming" && (
          <Link
            to={`/student/assignments/${assignment.assignmentId}`}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Xem chi tiết
          </Link>
        )}
        {assignment.status === "submitted" && assignment.latestAttempt && (
          <Link
            to={`/student/results/${assignment.latestAttempt.attemptId}`}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Xem kết quả
          </Link>
        )}
        {assignment.status === "expired" && (
          <span className="px-5 py-2.5 bg-slate-100 text-gray-500 font-medium rounded-lg cursor-not-allowed">
            Đã quá hạn
          </span>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
