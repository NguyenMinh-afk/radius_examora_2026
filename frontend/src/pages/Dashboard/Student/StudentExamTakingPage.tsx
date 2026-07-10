import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  Clock,
  Calculator,
  Code,
  Book,
  HelpCircle,
  Shield,
  Flag,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import {
  startAssignment,
  submitStudentAssignment,
  getAssignmentQuestions,
  type AssignmentQuestion,
  type AssignmentSubmitAnswer,
} from "../../../api/studentApi";

const normalizeQuestions = (questions: AssignmentQuestion[] | undefined) =>
  (questions || []).map((question, index) => ({
    ...question,
    displayIndex: index + 1,
  }));

const formatTime = (seconds: number) => {
  const safeSeconds = Number(seconds) || 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

interface ExamMeta {
  title: string;
  instructions: string | null;
  duration: number;
  totalPoints: number;
}

const StudentExamTakingPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [examMeta, setExamMeta] = useState<ExamMeta | null>(null);
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // LocalStorage key cho từng assignment
  const storageKey = `exam_in_progress_${assignmentId}`;
  const currentQuestion = useMemo(() => {
    const normalized = normalizeQuestions(questions);
    return normalized[activeQuestionIndex] || null;
  }, [questions, activeQuestionIndex]);

  const isStarted = Boolean(activeAttemptId);

  // Save exam state to localStorage when it changes
  useEffect(() => {
    if (!isStarted || !assignmentId) return;

    const state = {
      attemptId: activeAttemptId,
      answers: selectedAnswers,
      flagged: Array.from(flaggedQuestions),
      currentIndex: activeQuestionIndex,
      startedAt: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [isStarted, activeAttemptId, selectedAnswers, flaggedQuestions, activeQuestionIndex, assignmentId, storageKey]);

  useEffect(() => {
    if (!assignmentId) return;
    let isCancelled = false;

    const loadExamMeta = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check localStorage for existing exam state
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            setActiveAttemptId(parsed.attemptId || assignmentId);
            setSelectedAnswers(parsed.answers || {});
            setFlaggedQuestions(new Set(parsed.flagged || []));
            setActiveQuestionIndex(parsed.currentIndex || 0);
            // Calculate remaining time
            const elapsed = Math.floor((Date.now() - parsed.startedAt) / 1000);
            const data = await getAssignmentQuestions(assignmentId);
            if (isCancelled) return;
            const totalDuration = (data.duration || 60) * 60;
            const remaining = Math.max(0, totalDuration - elapsed);
            setExamMeta({
              title: data.title,
              instructions: data.instructions,
              duration: data.duration,
              totalPoints: data.totalPoints,
            });
            setQuestions(data.questions || []);
            setTimeLeft(remaining);
            setLoading(false);
            return;
          } catch {
            localStorage.removeItem(storageKey);
          }
        }

        // No saved state - load fresh
        const data = await getAssignmentQuestions(assignmentId);
        if (isCancelled) return;
        setExamMeta({
          title: data.title,
          instructions: data.instructions,
          duration: data.duration,
          totalPoints: data.totalPoints,
        });
        setQuestions(data.questions || []);
        setTimeLeft((data.duration || 60) * 60);
      } catch (loadError) {
        if (!isCancelled) {
          setError((loadError as Error).message || "Unable to load exam");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadExamMeta();
    return () => {
      isCancelled = true;
    };
  }, [assignmentId, storageKey]);

  useEffect(() => {
    if (!isStarted || timeLeft === null) return;
    if (timeLeft <= 0) {
      setError("Time is up!");
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, timeLeft]);

  // Block back navigation when exam has started
  useEffect(() => {
    if (!isStarted) return;

    // Push initial state to prevent back
    window.history.pushState(null, "", window.location.href);

    const handlePop = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
      setError("Bạn không thể quay lại trang trước khi đang làm bài kiểm tra!");
      setTimeout(() => setError(null), 3000);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Bạn đang làm bài kiểm tra. Bạn có chắc muốn rời đi không?";
      return e.returnValue;
    };

    window.addEventListener("popstate", handlePop);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePop);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isStarted]);

  const handleStart = async () => {
    if (!assignmentId) return;
    try {
      setError(null);
      const result = await startAssignment(assignmentId);
      const attemptId = result.attempt?.attemptId || assignmentId;
      setActiveAttemptId(attemptId);

      const savedState = localStorage.getItem(storageKey);
      const parsed = savedState ? JSON.parse(savedState) : {};
      const startedAt = parsed.startedAt || Date.now();

      localStorage.setItem(storageKey, JSON.stringify({
        ...parsed,
        attemptId,
        startedAt,
      }));
    } catch (startError) {
      setError((startError as Error).message || "Unable to start exam");
    }
  };

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedAnswers({});
  };

  const handleNext = () => {
    setActiveQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrevious = () => {
    setActiveQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!assignmentId || !activeAttemptId || questions.length === 0) {
      setError("Unable to submit exam");
      return;
    }

    const answers: AssignmentSubmitAnswer[] = questions.map((question) => {
      const selectedAnswerId = selectedAnswers[question.questionId];
      const selectedAnswer = question.answers.find((answer) => answer.id === selectedAnswerId);
      return {
        questionId: question.questionId,
        answerId: selectedAnswer?.id || null,
        isCorrect: Boolean(selectedAnswer?.isCorrect),
        timeSpent: 0,
      };
    });

    try {
      setSubmitting(true);
      setError(null);
      await submitStudentAssignment(assignmentId, activeAttemptId, answers);
      // Clear localStorage after successful submit
      localStorage.removeItem(storageKey);
      navigate("/student/results");
    } catch (submitError) {
      setError((submitError as Error).message || "Unable to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!isStarted && !error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="mb-6 flex items-center gap-3">
            <Link
              to="/student/assignments"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{examMeta?.title || "Exam"}</h1>
              <p className="text-sm text-slate-500">Read the instructions before starting</p>
            </div>
          </div>
          <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            {examMeta?.instructions || "Complete this exam before the deadline."}
          </div>
          <div className="mb-6 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase text-slate-400">Duration</p>
              <p className="mt-1 font-semibold text-slate-900">{examMeta?.duration || 60} minutes</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase text-slate-400">Questions</p>
              <p className="mt-1 font-semibold text-slate-900">{questions.length} questions</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase text-slate-400">Total Points</p>
              <p className="mt-1 font-semibold text-slate-900">{examMeta?.totalPoints || 100} points</p>
            </div>
          </div>
          <button
            onClick={handleStart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (error && !isStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl border border-red-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" size={24} />
            <h2 className="text-lg font-semibold text-red-700">Error</h2>
          </div>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Link
            to="/student/assignments"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to assignments
          </Link>
        </div>
      </div>
    );
  }

  const totalQuestions = normalizeQuestions(questions).length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = flaggedQuestions.size;
  const progressPercent = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Secure Badge */}
          <div className="flex items-center gap-4">
            {/* Logo giống Sidebar */}
            <button
              onClick={() => {
                if (isStarted) {
                  setError("Bạn không thể rời khỏi trang khi đang làm bài kiểm tra!");
                  setTimeout(() => setError(null), 3000);
                } else {
                  navigate("/student");
                }
              }}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 flex items-center justify-center shadow-md">
                <div
                  className="w-4 h-4 bg-white"
                  style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
                />
              </div>
              <span className="text-xl font-bold text-gray-900">EXMORA</span>
            </button>

            {/* Secure Session Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <Shield size={14} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 tracking-wide">SECURE SESSION</span>
            </div>
          </div>

          {/* Center: Timer */}
          <div className="flex items-center gap-2 px-5 py-2 bg-slate-800 text-white rounded-xl shadow-lg">
            <Clock size={18} className="text-amber-400" />
            <span className="text-base font-mono font-bold">{timeLeft === null ? "--:--" : formatTime(timeLeft)}</span>
            <span className="text-xs font-medium text-slate-300 uppercase">Remaining</span>
          </div>

          {/* Right: Exit & Finish */}
          <div className="flex items-center gap-3">
            <Link
              to="/student/assignments"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition border border-slate-200 rounded-xl"
            >
              <ArrowLeft size={16} />
              Exit
            </Link>
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition shadow-sm"
            >
              <X size={16} />
              Finish Exam
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex p-4 gap-4">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 bg-white rounded-2xl border-2 border-dashed border-blue-300 p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Exam Progress */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Exam Progress</h3>
            <p className="text-xs text-slate-500 mb-3">Computer Science • Algorithms</p>
            <div className="flex items-center justify-between text-sm font-semibold mb-1">
              <span className="text-blue-600">{answeredCount} / {totalQuestions} Completed</span>
              <span className="text-blue-600">{progressPercent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-blue-100">
              <div
                className="h-1.5 rounded-full bg-blue-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Grid */}
          <div>
            <div className="grid grid-cols-5 gap-2">
              {normalizeQuestions(questions).map((question, index) => {
                const isActive = index === activeQuestionIndex;
                const isAnswered = Boolean(selectedAnswers[question.questionId]);
                const isFlagged = flaggedQuestions.has(question.questionId);
                return (
                  <button
                    key={question.questionId}
                    onClick={() => setActiveQuestionIndex(index)}
                    className={`relative flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? "bg-cyan-400 text-slate-900 ring-2 ring-blue-500 shadow-md"
                        : isAnswered
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {index + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-xs font-medium text-slate-700">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs font-medium text-slate-700">Flagged for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <span className="text-xs font-medium text-slate-700">Unanswered</span>
            </div>
          </div>

          {/* Proctor Status */}
          <div className="mt-auto">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Eye size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Proctor Status</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Camera Active
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Microphone Active
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN EXAM AREA */}
        <main className="flex-1 bg-white rounded-2xl border-2 border-dashed border-blue-300 flex flex-col">
          {/* Question Header */}
          <div className="px-8 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded">
                  Section 1: Data Structures
                </span>
                <span className="text-sm text-slate-500">
                  Question {currentQuestion ? currentQuestion.displayIndex : "-"} of {totalQuestions}
                </span>
              </div>
              <button
                onClick={() => currentQuestion && handleToggleFlag(currentQuestion.questionId)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  currentQuestion && flaggedQuestions.has(currentQuestion.questionId)
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Flag size={14} className={currentQuestion && flaggedQuestions.has(currentQuestion.questionId) ? "fill-amber-500" : ""} />
                <span className="text-xs font-semibold uppercase tracking-wide">Flag for Review</span>
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Question {currentQuestion ? currentQuestion.displayIndex : "-"}
            </h2>
            <p className="text-base leading-relaxed text-slate-800 mb-8">
              {currentQuestion?.content || "No question content"}
            </p>

            {/* Answer Options */}
            <div className="space-y-3 max-w-3xl">
              {currentQuestion?.answers.map((answer) => {
                const selectedAnswerId = selectedAnswers[currentQuestion.questionId];
                const isSelected = selectedAnswerId === answer.id;
                const letter = String.fromCharCode(65 + currentQuestion.answers.indexOf(answer));
                return (
                  <label
                    key={answer.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-white shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-white text-blue-600"
                          : "border-slate-300 bg-white text-slate-500"
                      }`}
                    >
                      {letter}
                    </div>
                    <input
                      type="radio"
                      name="exam-answer"
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(currentQuestion.questionId, answer.id)}
                      className="sr-only"
                    />
                    <span className="text-sm text-slate-800">{answer.content}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="border-t border-slate-100 px-8 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={activeQuestionIndex === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-sm font-semibold text-slate-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous Question
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={!currentQuestion || !selectedAnswers[currentQuestion.questionId]}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold transition hover:bg-blue-700 shadow-sm"
              >
                Next Question
                <ChevronLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT TOOLS BAR */}
        <aside className="w-16 bg-white rounded-2xl border-2 border-dashed border-blue-300 flex flex-col items-center py-4 gap-3">
          <button
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
            title="Calculator"
          >
            <Calculator size={20} />
          </button>
          <button
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
            title="Code Editor"
          >
            <Code size={20} />
          </button>
          <button
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
            title="Formula Book"
          >
            <Book size={20} />
          </button>
          <div className="flex-1"></div>
          <button
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
            title="Help"
          >
            <HelpCircle size={20} />
          </button>
        </aside>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Submit Exam?</h2>
            </div>
            <div className="mb-6 space-y-2 text-sm text-slate-600">
              <p>You have answered <span className="font-semibold text-slate-900">{answeredCount}</span> out of <span className="font-semibold text-slate-900">{totalQuestions}</span> questions.</p>
              {unansweredCount > 0 && (
                <p className="text-amber-600">You have <span className="font-semibold">{unansweredCount}</span> unanswered questions.</p>
              )}
              {flaggedCount > 0 && (
                <p className="text-blue-600">You have <span className="font-semibold">{flaggedCount}</span> questions flagged for review.</p>
              )}
              <p className="text-slate-500">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Continue Exam
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIME WARNING */}
      {timeLeft !== null && timeLeft <= 300 && timeLeft > 0 && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white rounded-xl shadow-lg p-4 flex items-center gap-3">
          <Clock size={20} className="text-amber-400" />
          <div>
            <p className="text-sm font-semibold">Time running low!</p>
            <p className="text-xs text-red-200">Less than {Math.ceil(timeLeft / 60)} minutes remaining</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExamTakingPage;