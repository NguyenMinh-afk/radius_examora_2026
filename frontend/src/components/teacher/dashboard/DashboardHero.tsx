import React from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, HelpCircle } from "lucide-react";

interface DashboardHeroProps {
  teacherName: string;
  overview: {
    classCount: number;
    studentCount: number;
    examCount: number;
    openAssignments: number;
    pendingGrades: number;
  };
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ teacherName, overview }) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute right-0 top-0 opacity-10">
        <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
          <circle cx="250" cy="50" r="200" fill="white" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-3xl font-extrabold mb-2">
          Xin chào, {teacherName}!
        </h1>
        <p className="text-blue-100 text-base mb-6">
          Bạn đang quản lý {overview.classCount} lớp học với {overview.studentCount} sinh viên
          {overview.pendingGrades > 0 && (
            <span className="text-amber-200"> · Có {overview.pendingGrades} bài làm cần xem</span>
          )}
        </p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-blue-100">
              {overview.openAssignments} bài thi đang mở
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-sm text-blue-100">
              {overview.examCount} đề thi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-300" />
            <span className="text-sm text-blue-100">
              {overview.pendingGrades} bài chưa chấm
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/teacher/exams"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-50 transition"
          >
            <Plus size={18} />
            Tạo đề thi
          </Link>
          <Link
            to="/teacher/assignments"
            className="inline-flex items-center gap-2 bg-blue-500 bg-opacity-20 border border-white border-opacity-30 text-white font-semibold rounded-xl px-5 py-2.5 hover:bg-opacity-30 transition"
          >
            <FileText size={18} />
            Giao bài
          </Link>
          <Link
            to="/teacher/questions"
            className="inline-flex items-center gap-2 bg-blue-500 bg-opacity-20 border border-white border-opacity-30 text-white font-semibold rounded-xl px-5 py-2.5 hover:bg-opacity-30 transition"
          >
            <HelpCircle size={18} />
            Tạo câu hỏi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
