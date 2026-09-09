import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Clock } from "lucide-react";
import type { NextAssignment } from "../../../api/studentApi";
import { useTheme } from "../../../contexts/useTheme";

interface NextAssignmentCardProps {
  assignment: NextAssignment;
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

const NextAssignmentCard: React.FC<NextAssignmentCardProps> = ({ assignment }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl shadow-sm border ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className={`p-5 border-b flex items-center justify-between ${
        isDark ? "border-white/10" : "border-slate-100"
      }`}>
        <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <FileText size={20} className="text-blue-500" />
          Bài thi gần nhất
        </h2>
        <Link
          to="/student/assignments"
          className={`text-sm flex items-center gap-1 ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
        >
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>
      <div className="p-5">
        <div className={`border rounded-lg p-4 transition ${
          isDark
            ? "border-white/10 hover:border-blue-500/40"
            : "border-slate-200 hover:border-blue-300"
        }`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{assignment.title}</h3>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              isDark
                ? "bg-amber-500/20 text-amber-400"
                : "bg-amber-100 text-amber-700"
            }`}>
              Sắp diễn ra
            </span>
          </div>
          <p className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{assignment.className || "N/A"}</p>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-4 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Mở: {formatDateTime(assignment.startTime)}
              </span>
            </div>
            <Link
              to={`/student/assignments/${assignment.assignmentId}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextAssignmentCard;