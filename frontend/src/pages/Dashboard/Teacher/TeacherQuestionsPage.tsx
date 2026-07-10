import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { HelpCircle, Plus, RefreshCw } from "lucide-react";
import { getQuestions } from "../../../api/questionApi";
import { QuestionCard, QuestionFilters } from "../../../components/teacher/questions";
import { LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";
import type { QuestionItem } from "../../../api/questionApi";

const TeacherQuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      setRefreshing(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuestions();
  };

  const total = questions.length;
  const activeCount = total;
  const aiGeneratedCount = 0;

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Question Bank</h1>
            <p className="mt-1 text-sm text-slate-500">Manage exam questions and answer sets</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link
            to="/teacher/questions/create"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-5 py-2.5 shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Question
          </Link>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            AI Generate
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Questions</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{total}</div>
          <div className="mt-1 text-xs text-slate-500">Current list</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Visible</div>
          <div className="mt-2 text-3xl font-bold text-emerald-700">{activeCount}</div>
          <div className="mt-1 text-xs text-slate-500">{total - activeCount} hidden</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">AI Generated</div>
          <div className="mt-2 text-3xl font-bold text-blue-700">{aiGeneratedCount}</div>
          <div className="mt-1 text-xs text-slate-500">From AI models</div>
        </div>
      </div>

      <div className="mt-6">
        <QuestionFilters
          search={search}
          onSearchChange={setSearch}
          onSearch={fetchQuestions}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
        />
      </div>

      {loading && <LoadingState size="lg" text="Loading questions..." />}

      {error && !loading && (
        <div className="mt-6">
          <ErrorState message={error} onRetry={fetchQuestions} />
        </div>
      )}

      {!loading && !error && displayQuestions.length === 0 && (
        <EmptyState
          icon={<HelpCircle size={36} className="text-slate-300" />}
          title="No questions found"
          description={search || difficulty ? "Try changing filters." : "Start by creating questions for your bank."}
        />
      )}

      {!loading && !error && displayQuestions.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {displayQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onDeleted={(deletedId) => {
                setQuestions((prev) => prev.filter((item) => item.id !== deletedId));
                setDisplayQuestions((prev) => prev.filter((item) => item.id !== deletedId));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherQuestionsPage;
