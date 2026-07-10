import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, X, BookOpen, Gauge, Star, FileText } from "lucide-react";
import { getQuestionById, createQuestion, updateQuestion, type CreateQuestionPayload } from "../../../api/questionApi";

const emptyAnswer = () => ({ id: undefined as string | undefined, content: "", isCorrect: false });

const TeacherQuestionFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [points, setPoints] = useState("1");
  const [answers, setAnswers] = useState<{ id?: string; content: string; isCorrect: boolean }[]>([
    emptyAnswer(),
    emptyAnswer(),
    emptyAnswer(),
    emptyAnswer(),
  ]);

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getQuestionById(id);
        if (!cancelled) {
          setContent(data.content || "");
          setQuestionType(data.questionType || "multiple_choice");
          setDifficulty(data.difficulty || "medium");
          setPoints("1");
          const mappedAnswers = (data.answers || []).map((a) => ({
            id: a.id,
            content: a.content,
            isCorrect: a.isCorrect,
          }));
          setAnswers(mappedAnswers.length > 0 ? mappedAnswers : [emptyAnswer(), emptyAnswer(), emptyAnswer(), emptyAnswer()]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không thể tải chi tiết câu hỏi");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const updateAnswer = (index: number, patch: Partial<typeof answers[number]>) => {
    setAnswers((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const setCorrectAnswer = (index: number) => {
    setAnswers((prev) => prev.map((item, idx) => ({ ...item, isCorrect: idx === index })));
  };

  const addAnswer = () => setAnswers((prev) => [...prev, emptyAnswer()]);

  const removeAnswer = (index: number) => {
    setAnswers((prev) => (prev.length > 2 ? prev.filter((_, idx) => idx !== index) : prev));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      setError("Please enter question content");
      return;
    }

    const validAnswers = answers.filter((a) => a.content.trim());
    if (validAnswers.length < 2) {
      setError("Question requires at least 2 answers");
      return;
    }
    if (!validAnswers.some((a) => a.isCorrect)) {
      setError("Please select at least 1 correct answer");
      return;
    }

    const payload: CreateQuestionPayload = {
      content: content.trim(),
      questionType,
      difficulty,
      answers: validAnswers.map((answer) => ({
        id: answer.id,
        content: answer.content,
        isCorrect: answer.isCorrect,
      })),
      tagIds: [],
    };

    try {
      setSaving(true);
      setError(null);
      if (isEdit && id) {
        await updateQuestion(id, payload);
      } else {
        await createQuestion(payload);
      }
      navigate("/teacher/questions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/teacher/questions"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{isEdit ? "Edit Question" : "Create Question"}</h1>
            <p className="mt-1 text-sm text-slate-500">{isEdit ? "Update question content and answers" : "Build a new question for your question bank"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {isEdit ? "Editing mode" : "Creation mode"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Question Content</h2>
                  <p className="text-xs text-slate-500">Write the main question text</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter question content..."
                  className="min-h-[160px] w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Question Type</label>
                  <div className="relative">
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-2.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="multiple_choice">Multiple choice</option>
                      <option value="true_false">True / False</option>
                      <option value="matching">Matching</option>
                      <option value="fill_blank">Fill in blank</option>
                    </select>
                    <BookOpen size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Difficulty</label>
                    <div className="relative">
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-2.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="very_hard">Very hard</option>
                      </select>
                      <Gauge size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Points</label>
                    <div className="relative">
                      <input
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                        type="number"
                        min="1"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <Star size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Answers</h2>
                    <p className="text-xs text-slate-500">Select the correct answer</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{answers.length} options</span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`group flex items-center gap-3 rounded-xl border p-3.5 transition ${
                      answer.isCorrect ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-answer-${id}`}
                        checked={answer.isCorrect}
                        onChange={() => setCorrectAnswer(index)}
                        className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        value={answer.content}
                        onChange={(e) => updateAnswer(index, { content: e.target.value })}
                        placeholder={`Answer ${index + 1}`}
                        className={`flex-1 rounded-lg border bg-white p-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-100 ${
                          answer.isCorrect ? "border-emerald-300 focus:border-emerald-400" : "border-slate-200 focus:border-blue-500"
                        } text-slate-800`}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAnswer}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600"
                >
                  <Plus size={16} />
                  Add answer
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/teacher/questions"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <X size={16} />
            Cancel
          </Link>
          <button
            disabled={saving}
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving..." : isEdit ? "Save Question" : "Create Question"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherQuestionFormPage;
