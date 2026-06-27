import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { HelpCircle, Plus } from "lucide-react";
import { getQuestions } from "../../../api/questionApi";
import { QuestionCard, QuestionFilters } from "../../../components/teacher/questions";
import { LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";
import type { QuestionItem } from "../../../api/questionApi";

const TeacherQuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [displayQuestions, setDisplayQuestions] = useState<QuestionItem[]>([]);
  const [difficulty, setDifficulty] = useState("");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuestions({ search: search || undefined });
      setQuestions(data.items || []);
      setDisplayQuestions(data.items || []);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = questions;
    if (difficulty) {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }
    setDisplayQuestions(filtered);
  }, [difficulty, questions]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ngân hàng câu hỏi</h1>
          <p className="text-sm text-slate-500 mt-1">
            {questions.length > 0 ? `${questions.length} câu hỏi` : "Quản lý câu hỏi thi"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/teacher/questions/create"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Tạo câu hỏi
          </Link>
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            AI Tạo câu hỏi
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <QuestionFilters
          search={search}
          onSearchChange={setSearch}
          onSearch={fetchQuestions}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
        />
      </div>

      {/* Loading */}
      {loading && <LoadingState size="lg" text="Đang tải câu hỏi..." />}

      {/* Error */}
      {error && !loading && (
        <div className="mb-6">
          <ErrorState message={error} onRetry={fetchQuestions} />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && displayQuestions.length === 0 && (
        <EmptyState
          icon={<HelpCircle size={36} className="text-slate-300" />}
          title="Không tìm thấy câu hỏi nào"
          description={search || difficulty ? "Thử thay đổi bộ lọc." : "Bắt đầu tạo câu hỏi cho ngân hàng của bạn."}
        />
      )}

      {/* Grid */}
      {!loading && !error && displayQuestions.length > 0 && (
        <div className="space-y-3">
          {displayQuestions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherQuestionsPage;
