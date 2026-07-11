import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Edit, Trash2, Copy } from "lucide-react";
import type { QuestionItem } from "../../../api/questionApi";
import StatusBadge, { type BadgeVariant } from "../shared/StatusBadge";

interface QuestionCardProps {
  question: QuestionItem;
  onDeleted?: (id: string) => void;
  isDark?: boolean;
}

const difficultyConfig: Record<string, { label: string; variant: string }> = {
  easy: { label: "Dễ", variant: "success" },
  medium: { label: "Trung bình", variant: "warning" },
  hard: { label: "Khó", variant: "danger" },
  very_hard: { label: "Rất khó", variant: "purple" },
};

const typeLabels: Record<string, string> = {
  multiple_choice: "Trắc nghiệm",
  true_false: "Đúng/Sai",
  matching: "Nối",
  fill_blank: "Điền chỗ trống",
};

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onDeleted, isDark }) => {
  const diff = difficultyConfig[question.difficulty] || { label: question.difficulty, variant: "neutral" };
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa câu hỏi này?");
    if (!confirmed) return;
    try {
      setDeleting(true);
      const { deleteQuestionApi } = await import("../../../api/questionApi");
      await deleteQuestionApi(question.id);
      onDeleted?.(question.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa câu hỏi thất bại");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`rounded-xl border shadow-sm p-5 transition ${
      isDark
        ? "bg-slate-900 border-white/10 hover:border-blue-500/40"
        : "bg-white border-slate-200 hover:border-blue-200"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={question.difficulty} variant={diff.variant as BadgeVariant} label={diff.label} isDark={isDark} />
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isDark ? "text-gray-300 bg-white/5" : "text-slate-600 bg-slate-100"
            }`}>
              {typeLabels[question.questionType] || question.questionType}
            </span>
            {question.tags && question.tags.length > 0 && (
              <span className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                Tags: {question.tags.map((t) => t.name).join(", ")}
              </span>
            )}
          </div>

          <p className={`text-sm leading-relaxed line-clamp-2 mb-2 ${isDark ? "text-gray-200" : "text-slate-800"}`}>
            {question.content}
          </p>

          {question.answers && question.answers.length > 0 && (
            <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>
              {question.answers.length} đáp án
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button className={`p-2 rounded-lg transition ${
            isDark
              ? "text-gray-500 hover:text-blue-400 hover:bg-blue-500/20"
              : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
          }`} title="Xem">
            <Eye size={16} />
          </button>
          <Link to={`/teacher/questions/${question.id}`} className={`p-2 rounded-lg transition ${
            isDark
              ? "text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/20"
              : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
          }`} title="Sửa">
            <Edit size={16} />
          </Link>
          <button className={`p-2 rounded-lg transition ${
            isDark
              ? "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          }`} title="Nhân bản">
            <Copy size={16} />
          </button>
          <button
            disabled={deleting}
            onClick={handleDelete}
            className={`p-2 rounded-lg transition disabled:opacity-60 ${
              isDark
                ? "text-gray-500 hover:text-red-400 hover:bg-red-500/20"
                : "text-slate-400 hover:text-red-600 hover:bg-red-50"
            }`}
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
