import React from "react";
import { Link } from "react-router-dom";
import { FileText, Clock } from "lucide-react";
import type { DashboardOverview } from "../../../api/studentApi";

interface DashboardHeroProps {
  studentName: string;
  overview: DashboardOverview;
  nextAssignmentTitle?: string;
  nextAssignmentTime?: string;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  studentName,
  overview,
  nextAssignmentTitle,
  nextAssignmentTime,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Xin chào, {studentName}!
          </h1>
          <p className="text-blue-100">
            Bạn đang tham gia <strong>{overview.classCount} lớp học</strong> và có{" "}
            <strong>{overview.upcomingAssignments} bài thi sắp tới</strong>.
          </p>
          <div className="mt-4 space-y-1 text-sm text-blue-100">
            {overview.openAssignments > 0 && (
              <p>• {overview.openAssignments} bài thi đang mở để làm ngay</p>
            )}
            <p>• Điểm trung bình hiện tại: {overview.averageScore || "N/A"}</p>
            {nextAssignmentTitle && nextAssignmentTime && (
              <p>
                • Lịch thi gần nhất: <strong>{nextAssignmentTitle}</strong> –{" "}
                {nextAssignmentTime}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          {overview.openAssignments > 0 && (
            <Link
              to="/student/assignments"
              className="px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition flex items-center gap-2"
            >
              <FileText size={18} />
              Vào bài thi
            </Link>
          )}
          <Link
            to="/student/classes"
            className="px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition flex items-center gap-2"
          >
            <Clock size={18} />
            Xem lịch thi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;