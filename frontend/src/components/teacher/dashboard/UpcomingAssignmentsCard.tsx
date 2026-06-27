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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Đang mở</span>;
    case "upcoming":
      return <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Sắp diễn ra</span>;
    case "closed":
      return <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Đã đóng</span>;
    default:
      return <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{status}</span>;
  }
};

const UpcomingAssignmentsCard: React.FC<UpcomingAssignmentsCardProps> = ({ assignments }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Bài thi sắp tới</h3>
          <p className="text-sm text-slate-500 mt-0.5">Các bài thi cần theo dõi</p>
        </div>
        <Link
          to="/teacher/schedule"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Xem tất cả
          <ArrowRight size={16} />
        </Link>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Không có bài thi nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.slice(0, 5).map((item) => (
            <Link
              key={item.assignmentId}
              to={`/teacher/assignments/${item.assignmentId}`}
              className="block p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700">
                      {item.title}
                    </h4>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    {item.className} · {item.examName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
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
