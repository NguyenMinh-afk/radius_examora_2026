import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  BookOpenCheck,
  CircleDot,
  Eye,
  EyeOff,
  RefreshCw,
  RotateCcw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  getAdminQuestionById,
  getAdminQuestions,
  updateAdminQuestionStatus,
  type AdminQuestion,
  type Pagination,
} from "../../api/Admin";
import ConfirmDialog from "./ConfirmDialog";

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 0,
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const shortText = (value: string, max = 120) =>
  value.length > max ? `${value.slice(0, max).trim()}...` : value;

const renderOptions = (options: unknown) => {
  if (Array.isArray(options)) {
    return options.map((option, index) => (
      <div key={`${index}-${String(option)}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {String(option)}
      </div>
    ));
  }

  if (options && typeof options === "object") {
    return Object.entries(options as Record<string, unknown>).map(([key, value]) => (
      <div key={key} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">{key}.</span> {String(value)}
      </div>
    ));
  }

  return <div className="text-sm text-slate-500">No options available.</div>;
};

const QuestionModerationPanel: React.FC = () => {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<AdminQuestion | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "">("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"ai" | "manual" | "">("");
  const [courseIdFilter, setCourseIdFilter] = useState("");

  const loadQuestions = useCallback(
    async (page = pagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminQuestions({
          page,
          limit: pagination.limit,
          search,
          is_active: statusFilter,
          difficulty: difficultyFilter,
          source: sourceFilter,
          course_id: courseIdFilter ? Number(courseIdFilter) : "",
        });

        setQuestions(data.questions);
        setPagination(data.pagination);
      } catch {
        setError("Unable to load questions. Please check the backend server and token.");
      } finally {
        setLoading(false);
      }
    },
    [
      courseIdFilter,
      difficultyFilter,
      pagination.limit,
      pagination.page,
      search,
      sourceFilter,
      statusFilter,
    ]
  );

  useEffect(() => {
    void loadQuestions(1);
  }, []);

  const summary = useMemo(() => {
    const visible = questions.filter((question) => question.is_active).length;
    const aiGenerated = questions.filter((question) => question.is_ai_generated).length;
    const hidden = questions.length - visible;
    return { visible, aiGenerated, hidden };
  }, [questions]);

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    setDifficultyFilter("");
    setSourceFilter("");
    setCourseIdFilter("");
    setTimeout(() => void loadQuestions(1), 0);
  };

  const handleViewDetail = async (question: AdminQuestion) => {
    setDetailLoading(true);
    setError(null);

    try {
      const detail = await getAdminQuestionById(question.id);
      setSelectedQuestion(detail);
    } catch {
      setError("Unable to load question detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!pendingQuestion) return;

    setActionId(pendingQuestion.id);
    setError(null);

    try {
      await updateAdminQuestionStatus(pendingQuestion.id, !pendingQuestion.is_active);
      setPendingQuestion(null);
      await loadQuestions();
    } catch {
      setError("Unable to update question visibility.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <ConfirmDialog
        open={Boolean(pendingQuestion)}
        title={pendingQuestion?.is_active ? "Hide question" : "Show question"}
        message={
          pendingQuestion
            ? `${pendingQuestion.is_active ? "Hide" : "Show"} this question from the question bank?`
            : ""
        }
        confirmText={pendingQuestion?.is_active ? "Hide question" : "Show question"}
        tone={pendingQuestion?.is_active ? "danger" : "primary"}
        loading={Boolean(pendingQuestion && actionId === pendingQuestion.id)}
        onCancel={() => setPendingQuestion(null)}
        onConfirm={() => void handleToggleStatus()}
      />
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <BookOpenCheck size={19} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-950">Question Bank Control</h2>
            <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                {pagination.total} total
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200">
                {summary.visible} visible
              </span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-200">
                {summary.aiGenerated} AI generated
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadQuestions()}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 px-5 py-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Questions</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-950">{pagination.total}</div>
          <div className="mt-0.5 text-xs text-slate-500">Current filters</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Visible On Page</div>
          <div className="mt-1.5 text-2xl font-bold text-emerald-700">{summary.visible}</div>
          <div className="mt-0.5 text-xs text-slate-500">{summary.hidden} hidden</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">AI Generated</div>
          <div className="mt-1.5 text-2xl font-bold text-blue-700">{summary.aiGenerated}</div>
          <div className="mt-0.5 text-xs text-slate-500">On this page</div>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void loadQuestions(1);
          }}
          className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_150px_150px_150px_130px_auto_auto]"
        >
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="content, answer..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
            <select
              value={String(statusFilter)}
              onChange={(event) => {
                const value = event.target.value;
                setStatusFilter(value === "" ? "" : value === "true");
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All</option>
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Difficulty
            <select
              value={difficultyFilter}
              onChange={(event) => setDifficultyFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Source
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as "ai" | "manual" | "")}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All</option>
              <option value="ai">AI</option>
              <option value="manual">Manual</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Course ID
            <input
              type="number"
              min="1"
              value={courseIdFilter}
              onChange={(event) => setCourseIdFilter(event.target.value)}
              placeholder="1"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <CircleDot size={15} />
            Apply
          </button>
        </form>
      </div>

      {error && <div className="mx-5 mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">Question</th>
              <th className="px-5 py-4">Course</th>
              <th className="px-5 py-4">Difficulty</th>
              <th className="px-5 py-4">Source</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm font-medium text-slate-500">
                  Loading questions...
                </td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm font-medium text-slate-500">
                  No questions match the current filters.
                </td>
              </tr>
            ) : (
              questions.map((question) => (
                <tr key={question.id} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                  <td className="max-w-md px-5 py-4">
                    <div className="font-semibold text-slate-900">{shortText(question.content)}</div>
                    <div className="mt-1 text-xs text-slate-500">{question.question_type}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-700">{question.course_code || `Course #${question.course_id}`}</div>
                    <div className="text-xs text-slate-500">{question.course_name || "Course unavailable"}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      {question.is_ai_generated ? <Bot size={15} /> : <UserRound size={15} />}
                      {question.is_ai_generated ? "AI" : "Manual"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        question.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {question.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                      {question.is_active ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{formatDate(question.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void handleViewDetail(question)}
                        disabled={detailLoading}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingQuestion(question)}
                        disabled={actionId === question.id}
                        className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold transition disabled:opacity-60 ${
                          question.is_active
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {question.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        {question.is_active ? "Hide" : "Show"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          Showing page <span className="font-semibold text-slate-700">{pagination.page}</span> of{" "}
          <span className="font-semibold text-slate-700">{Math.max(pagination.totalPages, 1)}</span>,{" "}
          <span className="font-semibold text-slate-700">{pagination.total}</span> total questions
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => void loadQuestions(pagination.page - 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => void loadQuestions(pagination.page + 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Question Detail</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Read-only moderation view. Academic content is not editable from Admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close question detail"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
              <div className="space-y-5">
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Content</div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
                    {selectedQuestion.content}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Options</div>
                  <div className="grid gap-2">{renderOptions(selectedQuestion.options)}</div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Correct Answer
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                      {selectedQuestion.correct_answer}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Explanation
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                      {selectedQuestion.explanation || "No explanation."}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-3 rounded-lg bg-slate-50 p-4 text-sm">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Course</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selectedQuestion.course_name || `Course #${selectedQuestion.course_id}`}
                  </div>
                  <div className="text-slate-500">{selectedQuestion.course_code || "-"}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Creator</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selectedQuestion.creator_name || "Unknown"}
                  </div>
                  <div className="text-slate-500">{selectedQuestion.creator_email || "-"}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Type</div>
                    <div className="mt-1 font-semibold text-slate-900">{selectedQuestion.question_type}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Difficulty</div>
                    <div className="mt-1 font-semibold capitalize text-slate-900">{selectedQuestion.difficulty}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Source</div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {selectedQuestion.is_ai_generated ? "AI" : "Manual"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {selectedQuestion.is_active ? "Visible" : "Hidden"}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">AI Model</div>
                  <div className="mt-1 font-semibold text-slate-900">{selectedQuestion.ai_model || "-"}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Keywords</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedQuestion.keywords?.length ? (
                      selectedQuestion.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">No keywords.</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Created</div>
                  <div className="mt-1 font-semibold text-slate-900">{formatDate(selectedQuestion.created_at)}</div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default QuestionModerationPanel;
