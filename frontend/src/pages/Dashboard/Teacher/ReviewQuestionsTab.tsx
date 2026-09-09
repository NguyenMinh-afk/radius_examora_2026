import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import { useTheme } from "../../../contexts/useTheme";
import {
  getPendingQuestions,
  approveQuestion,
  rejectQuestion,
  type PendingQuestion,
} from "../../../api/aiApi";

const difficultyColors: Record<string, { text: string; bg: string }> = {
  easy: { text: "text-emerald-500", bg: "bg-emerald-500/10" },
  medium: { text: "text-amber-500", bg: "bg-amber-500/10" },
  hard: { text: "text-orange-500", bg: "bg-orange-500/10" },
  very_hard: { text: "text-red-500", bg: "bg-red-500/10" },
};

const difficultyLabels: Record<string, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
  very_hard: "Rất khó",
};

interface QuestionCardProps {
  question: PendingQuestion;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  isDark: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onApprove,
  onReject,
  isDark,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const diffStyle = difficultyColors[question.difficulty] || {
    text: "text-gray-400",
    bg: "bg-gray-500/10",
  };
  const diffLabel = difficultyLabels[question.difficulty] || question.difficulty;

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await onApprove(question.id);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading("reject");
    try {
      await onReject(question.id);
    } finally {
      setLoading(null);
    }
  };

  const correctOption = question.correctAnswer.toUpperCase();

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isDark
          ? "bg-slate-900 border-white/10"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-relaxed ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {question.questionContent}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${diffStyle.bg} ${diffStyle.text}`}
            >
              {diffLabel}
            </span>
            {question.topic && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                }`}
              >
                {question.topic}
              </span>
            )}
            <span
              className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}
            >
              {new Date(question.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            className={`p-2 rounded-lg transition ${
              loading === "approve"
                ? "opacity-50 cursor-not-allowed"
                : "text-emerald-500 hover:bg-emerald-500/20"
            }`}
            title="Duyệt câu hỏi"
          >
            {loading === "approve" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={loading !== null}
            className={`p-2 rounded-lg transition ${
              loading === "reject"
                ? "opacity-50 cursor-not-allowed"
                : "text-red-500 hover:bg-red-500/20"
            }`}
            title="Từ chối câu hỏi"
          >
            {loading === "reject" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <XCircle size={18} />
            )}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2 rounded-lg transition ${
              isDark
                ? "text-gray-400 hover:bg-slate-800"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div
          className={`border-t px-5 py-4 space-y-3 ${
            isDark ? "border-white/10" : "border-slate-100"
          }`}
        >
          {/* Options */}
          {[
            { key: "A", text: question.optionA },
            { key: "B", text: question.optionB },
            { key: "C", text: question.optionC },
            { key: "D", text: question.optionD },
          ].map(({ key, text }) => (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-lg p-3 text-sm ${
                key === correctOption
                  ? isDark
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : "bg-emerald-50 border border-emerald-200"
                  : isDark
                    ? "bg-slate-800/50"
                    : "bg-slate-50"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  key === correctOption
                    ? "bg-emerald-500 text-white"
                    : isDark
                      ? "bg-slate-700 text-gray-400"
                      : "bg-slate-200 text-slate-600"
                }`}
              >
                {key}
              </span>
              <span
                className={
                  isDark
                    ? key === correctOption
                      ? "text-emerald-400"
                      : "text-gray-300"
                    : key === correctOption
                      ? "text-emerald-700"
                      : "text-slate-700"
                }
              >
                {text}
              </span>
              {key === correctOption && (
                <span className="ml-auto text-xs text-emerald-500 font-medium">
                  Đáp án đúng
                </span>
              )}
            </div>
          ))}

          {/* Explanation */}
          {question.explanation && (
            <div
              className={`rounded-lg p-3 text-sm ${
                isDark ? "bg-blue-500/10" : "bg-blue-50"
              }`}
            >
              <p
                className={`text-xs font-medium mb-1 ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Giải thích
              </p>
              <p
                className={
                  isDark ? "text-gray-300 leading-relaxed" : "text-slate-700 leading-relaxed"
                }
              >
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ReviewQuestionsTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingQuestions();
      setQuestions(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải câu hỏi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleApprove = async (questionId: string) => {
    try {
      await approveQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Duyệt thất bại");
    }
  };

  const handleReject = async (questionId: string) => {
    try {
      await rejectQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Từ chối thất bại");
    }
  };

  const handleApproveAll = async () => {
    if (questions.length === 0) return;

    setApprovingAll(true);
    let approved = 0;
    let failed = 0;

    for (const q of questions) {
      try {
        await approveQuestion(q.id);
        approved++;
      } catch {
        failed++;
      }
    }

    setApprovingAll(false);

    if (failed === 0) {
      setQuestions([]);
      setError(null);
    } else {
      setError(
        `Đã duyệt ${approved} câu, thất bại ${failed} câu`
      );
      loadQuestions();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex items-center justify-between rounded-2xl border p-5 ${
          isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"
            }`}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h2
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Câu hỏi chờ duyệt
            </h2>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-slate-500"
              }`}
            >
              {questions.length > 0
                ? `Có ${questions.length} câu hỏi cần được duyệt trước khi thêm vào ngân hàng`
                : "Không có câu hỏi nào đang chờ duyệt"}
            </p>
          </div>
        </div>

        {questions.length > 0 && (
          <button
            onClick={handleApproveAll}
            disabled={approvingAll}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              isDark
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            } disabled:opacity-60`}
          >
            {approvingAll ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang duyệt...
              </>
            ) : (
              <>
                <CheckCheck size={16} />
                Duyệt tất cả ({questions.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            isDark
              ? "border-red-500/30 bg-red-500/10"
              : "border-red-200 bg-red-50"
          }`}
        >
          <AlertCircle
            size={18}
            className={isDark ? "text-red-400" : "text-red-600"}
          />
          <span
            className={isDark ? "text-red-400" : "text-red-700"}
          >
            {error}
          </span>
        </div>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2
            size={32}
            className={`animate-spin ${isDark ? "text-gray-400" : "text-slate-400"}`}
          />
        </div>
      ) : questions.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl border py-16 ${
            isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
          }`}
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
            }`}
          >
            <CheckCircle2 size={32} />
          </div>
          <p
            className={`mt-4 text-sm font-medium ${
              isDark ? "text-gray-400" : "text-slate-600"
            }`}
          >
            Tất cả câu hỏi đã được duyệt!
          </p>
          <p
            className={`mt-1 text-xs ${
              isDark ? "text-gray-500" : "text-slate-400"
            }`}
          >
            Không có câu hỏi nào đang chờ duyệt
          </p>
          <button
            onClick={loadQuestions}
            className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              isDark
                ? "text-gray-400 hover:bg-slate-800"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onApprove={handleApprove}
              onReject={handleReject}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewQuestionsTab;
