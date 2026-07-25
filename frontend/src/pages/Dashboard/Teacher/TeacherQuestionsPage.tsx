import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { HelpCircle, Plus, RefreshCw, FileStack } from "lucide-react";
import { getQuestions } from "../../../api/questionApi";
import { QuestionCard, QuestionFilters } from "../../../components/teacher/questions";
import BulkCreateQuestionsModal from "../../../components/teacher/questions/BulkCreateQuestionsModal";
import { LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";
import type { QuestionItem } from "../../../api/questionApi";
import { PageHeader, Card, StatCard, StatGrid } from "../../../components/shared";
import { useTheme } from "../../../contexts/useTheme";

const TeacherQuestionsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [displayQuestions, setDisplayQuestions] = useState<QuestionItem[]>([]);
  const [difficulty, setDifficulty] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [aiCount, setAiCount] = useState(0);

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
      setRefreshing(false);
    }
  };

  const fetchAiCount = async () => {
    try {
      const data = await getQuestions({ isAiGenerated: true, limit: 1 });
      setAiCount(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch AI count:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchAiCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = questions;
    if (difficulty) {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }
    setDisplayQuestions(filtered);
  }, [difficulty, questions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuestions();
  };

  const handleBulkSuccess = () => {
    fetchQuestions();
  };

  const total = questions.length;
  const activeCount = total;

  return (
    <div>
      <PageHeader
        title="Ngân hàng câu hỏi"
        icon={HelpCircle}
        description="Quản lý ngân hàng câu hỏi và bộ đáp án cho bài thi"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className={`inline-flex items-center gap-2 h-11 px-4 border rounded-lg text-sm font-semibold transition disabled:opacity-60 ${
                isDark
                  ? "border-white/10 bg-slate-800 text-gray-200 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Làm mới
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-2 h-11 px-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              <FileStack size={18} />
              Tạo nhiều câu hỏi
            </button>
            <Link
              to="/teacher/questions/create"
              className="inline-flex items-center gap-2 h-11 px-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Tạo câu hỏi
            </Link>
            <button className="inline-flex items-center gap-2 h-11 px-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              AI Tạo câu hỏi
            </button>
          </div>
        }
      />

      <StatGrid className="mt-6" columns={3}>
        <StatCard label="Tổng câu hỏi" value={total} icon={HelpCircle} variant="blue" isDark={isDark} />
        <StatCard label="Đang hoạt động" value={activeCount} icon={HelpCircle} variant="green" isDark={isDark} />
        <StatCard label="AI đã tạo" value={aiCount} icon={HelpCircle} variant="purple" isDark={isDark} />
      </StatGrid>

      <Card className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={fetchQuestions} isDark={isDark} />
        ) : (
          <>
            <QuestionFilters
              search={search}
              onSearchChange={setSearch}
              onSearch={fetchQuestions}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              isDark={isDark}
            />

            {loading && <LoadingState size="lg" text="Đang tải câu hỏi..." isDark={isDark} />}

            {!loading && displayQuestions.length === 0 && (
              <EmptyState
                icon={<HelpCircle size={36} className={isDark ? "text-slate-600" : "text-slate-300"} />}
                title="Chưa có câu hỏi nào"
                description={search || difficulty ? "Thử thay đổi bộ lọc." : "Bắt đầu tạo câu hỏi cho ngân hàng câu hỏi."}
                isDark={isDark}
              />
            )}

            {!loading && displayQuestions.length > 0 && (
              <div className="space-y-4">
                {displayQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isDark={isDark}
                    onDeleted={(deletedId) => {
                      setQuestions((prev) => prev.filter((item) => item.id !== deletedId));
                      setDisplayQuestions((prev) => prev.filter((item) => item.id !== deletedId));
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      <BulkCreateQuestionsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={handleBulkSuccess}
      />
    </div>
  );
};

export default TeacherQuestionsPage;
