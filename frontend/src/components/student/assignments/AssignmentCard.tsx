import React from "react";
import { Link } from "react-router-dom";
import type { Assignment } from "../../../api/studentApi";
import AssignmentStatusBadge from "./AssignmentStatusBadge";
import { useTheme } from "../../../contexts/useTheme";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl shadow-sm border hover:shadow-md transition-shadow p-5 ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{assignment.title}</h3>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {assignment.courseName} • {assignment.className}
          </p>
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>GV: {assignment.teacherName}</p>
        </div>
        <AssignmentStatusBadge status={assignment.status} isDark={isDark} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
        <div>
          <p className={isDark ? "text-gray-500" : "text-gray-400"}>Mở lúc</p>
          <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{formatDateTime(assignment.startTime)}</p>
        </div>
        <div>
          <p className={isDark ? "text-gray-500" : "text-gray-400"}>Đóng lúc</p>
          <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{formatDateTime(assignment.endTime)}</p>
        </div>
        <div>
          <p className={isDark ? "text-gray-500" : "text-gray-400"}>Thời gian</p>
          <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{assignment.duration || 60} phút</p>
        </div>
        <div>
          <p className={isDark ? "text-gray-500" : "text-gray-400"}>Điểm đạt</p>
          <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{assignment.passingScore || 0} điểm</p>
        </div>
        <div>
          <p className={isDark ? "text-gray-500" : "text-gray-400"}>Số lần làm</p>
          <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{assignment.attemptsUsed || 0}/{assignment.maxAttempts}</p>
        </div>
      </div>

      {assignment.latestAttempt && (
        <div className={`mb-4 p-3 rounded-lg border ${
          isDark
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "bg-green-50 border-green-100"
        }`}>
          <p className={`text-sm ${isDark ? "text-emerald-400" : "text-green-700"}`}>
            <strong>Điểm: {assignment.latestAttempt.score ?? "-"}</strong> ({assignment.latestAttempt.percentage ?? 0}%)
            {" | "}Nộp: {formatDateTime(assignment.latestAttempt.submittedAt)}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {assignment.status === "open" && (
          <Link
            to={`/student/assignments/${assignment.assignmentId}/take`}
            className={`px-5 py-2.5 font-medium rounded-lg transition ${
              isDark
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            Vào thi
          </Link>
        )}
        {assignment.status === "upcoming" && (
          <Link
            to={`/student/assignments/${assignment.assignmentId}`}
            className={`px-5 py-2.5 font-medium rounded-lg transition ${
              isDark
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Xem chi tiết
          </Link>
        )}
        {assignment.status === "submitted" && assignment.latestAttempt && (
          <Link
            to={`/student/results/${assignment.latestAttempt.attemptId}`}
            className={`px-5 py-2.5 font-medium rounded-lg transition ${
              isDark
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Xem kết quả
          </Link>
        )}
        {assignment.status === "expired" && (
          <span className={`px-5 py-2.5 font-medium rounded-lg cursor-not-allowed ${
            isDark ? "bg-white/5 text-gray-500" : "bg-slate-100 text-gray-500"
          }`}>
            Đã quá hạn
          </span>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;