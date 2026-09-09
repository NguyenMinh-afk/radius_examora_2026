import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, ArrowRight } from "lucide-react";

interface UpcomingAssignment {
  assignmentId: string;
  title: string;
  examName: string;
  className: string;
  startTime: string;
  endTime: string;
  studentAssigned: number;
  submitted: number;
  status: string;
}

interface UpcomingAssignmentsCardProps {
  assignments: UpcomingAssignment[];
  isDark?: boolean;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status: string, isDark?: boolean) => {
  const dark = isDark
    ? {
        open: "text-emerald-400 bg-emerald-500/20",
        upcoming: "text-blue-400 bg-blue-500/20",
        closed: "text-gray-400 bg-white/5",
        default: "text-gray-400 bg-white/5",
      }
    : {
        open: "text-green-700 bg-green-100",
        upcoming: "text-blue-700 bg-blue-100",
        closed: "text-gray-600 bg-gray-100",
        default: "text-gray-600 bg-gray-100",
      };
  switch (status) {
    case "open":
      return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dark.open}`}>Đang mở</span>;
    case "upcoming":
      return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dark.upcoming}`}>Sắp diễn ra</span>;
    case "closed":
      return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dark.closed}`}>Đã đóng</span>;
    default:
      return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dark.default}`}>{status}</span>;
  }
};

const UpcomingAssignmentsCard: React.FC<UpcomingAssignmentsCardProps> = ({ assignments, isDark }) => {
  return (
    <div className={`rounded-2xl border shadow-sm p-6 ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Bài thi sắp tới</h3>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Các bài thi cần theo dõi</p>
        </div>
        <Link
          to="/teacher/schedule"
          className={`flex items-center gap-1 text-sm font-medium ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
        >
          Xem tất cả
          <ArrowRight size={16} />
        </Link>
      </div>

      {assignments.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
          <Clock size={32} className={`mx-auto mb-2 opacity-50 ${isDark ? "text-gray-600" : ""}`} />
          <p className="text-sm">Không có bài thi nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.slice(0, 5).map((item) => (
            <Link
              key={item.assignmentId}
              to={`/teacher/assignments/${item.assignmentId}`}
              className={`block p-4 rounded-xl border transition group ${
                isDark
                  ? "border-white/10 hover:border-blue-500/40 hover:bg-white/5"
                  : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-semibold truncate group-hover:text-blue-500 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      {item.title}
                    </h4>
                    {getStatusBadge(item.status, isDark)}
                  </div>
                  <p className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                    {item.className} · {item.examName}
                  </p>
                  <div className={`flex items-center gap-3 text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDateTime(item.startTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {item.submitted}/{item.studentAssigned} đã nộp
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingAssignmentsCard;
