import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Clock } from "lucide-react";
import type { NextAssignment } from "../../../api/studentApi";

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
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          Bài thi gần nhất
        </h2>
        <Link
          to="/student/assignments"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>
      <div className="p-5">
        <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Sắp diễn ra
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-3">{assignment.className || "N/A"}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
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
