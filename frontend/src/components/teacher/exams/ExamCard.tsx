import React from "react";
import { Link } from "react-router-dom";
import { FileText, Edit, Trash2 } from "lucide-react";
import type { Exam } from "../../../api/teacherApi";
import StatusBadge from "../shared/StatusBadge";

interface ExamCardProps {
  exam: Exam;
  onEdit?: (exam: Exam) => void;
  onDelete?: (exam: Exam) => void;
  isDark?: boolean;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onEdit, onDelete, isDark }) => {
  return (
    <div className={`rounded-2xl border shadow-sm p-6 transition ${
      isDark
        ? "bg-slate-900 border-white/10 hover:border-blue-500/40 hover:shadow-md"
        : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-md"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isDark ? "bg-purple-500/20" : "bg-purple-50"
        }`}>
          <FileText size={22} className={isDark ? "text-purple-400" : "text-purple-600"} />
        </div>
        <StatusBadge status={exam.published ? "published" : "draft"} isDark={isDark} />
      </div>

      <h3 className={`text-sm font-bold mb-1 line-clamp-2 ${isDark ? "text-white" : "text-slate-900"}`}>{exam.title}</h3>
      <p className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{exam.courseName}</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`text-center p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{exam.questionCount}</p>
          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Câu hỏi</p>
        </div>
        <div className={`text-center p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{exam.duration}p</p>
          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Thời gian</p>
        </div>
        <div className={`text-center p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{exam.totalPoints}</p>
          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Điểm</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/teacher/exams/${exam.examId}`}
          className={`flex-1 text-center text-sm font-medium rounded-lg py-2 transition ${
            isDark ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30" : "text-blue-600 bg-blue-50 hover:bg-blue-100"
          }`}
        >
          Xem
        </Link>
        {onEdit && (
          <button
            onClick={() => onEdit(exam)}
            className={`p-2 rounded-lg transition ${
              isDark
                ? "text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/20"
                : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            <Edit size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(exam)}
            className={`p-2 rounded-lg transition ${
              isDark
                ? "text-gray-500 hover:text-red-400 hover:bg-red-500/20"
                : "text-slate-400 hover:text-red-600 hover:bg-red-50"
            }`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
