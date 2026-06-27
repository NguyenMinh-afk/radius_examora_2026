import React from "react";
import { Link } from "react-router-dom";
import { FileText, Edit, Trash2 } from "lucide-react";
import type { Exam } from "../../../api/teacherApi";
import StatusBadge from "../shared/StatusBadge";

interface ExamCardProps {
  exam: Exam;
  onEdit?: (exam: Exam) => void;
  onDelete?: (exam: Exam) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
          <FileText size={22} className="text-purple-600" />
        </div>
        <StatusBadge status={exam.published ? "published" : "draft"} />
      </div>

      {/* Info */}
      <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2">{exam.title}</h3>
      <p className="text-xs text-slate-500 mb-4">{exam.courseName}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <p className="text-sm font-bold text-slate-900">{exam.questionCount}</p>
          <p className="text-[10px] text-slate-400">Câu hỏi</p>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <p className="text-sm font-bold text-slate-900">{exam.duration}p</p>
          <p className="text-[10px] text-slate-400">Thời gian</p>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <p className="text-sm font-bold text-slate-900">{exam.totalPoints}</p>
          <p className="text-[10px] text-slate-400">Điểm</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/teacher/exams/${exam.examId}`}
          className="flex-1 text-center text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition"
        >
          Xem
        </Link>
        {onEdit && (
          <button
            onClick={() => onEdit(exam)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          >
            <Edit size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(exam)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
