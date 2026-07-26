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
import { useTheme } from "../../../contexts/useTheme";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-4 mx-auto mb-4 ${
            isDark ? "border-slate-700 border-t-blue-500" : "border-blue-600 border-t-transparent"
          }`} />
          <p className={isDark ? "text-gray-300" : "text-slate-600"}>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!isStarted && !error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className={`w-full max-w-2xl rounded-2xl shadow-lg border p-8 ${
          isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="mb-6 flex items-center gap-3">
            <Link
              to="/student/assignments"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                isDark
                  ? "border-white/10 text-gray-300 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{examMeta?.title || "Exam"}</h1>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>Read the instructions before starting</p>
            </div>
          </div>
          <div className={`mb-6 rounded-xl border p-4 text-sm ${
            isDark ? "border-white/10 bg-slate-800 text-gray-300" : "border-slate-100 bg-slate-50 text-slate-600"
          }`}>
            {examMeta?.instructions || "Complete this exam before the deadline."}
          </div>
          <div className="mb-6 grid grid-cols-3 gap-3 text-sm">
            <div className={`rounded-lg border p-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <p className={`text-xs font-semibold uppercase ${isDark ? "text-gray-500" : "text-slate-400"}`}>Duration</p>
              <p className={`mt-1 font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{examMeta?.duration || 60} minutes</p>
            </div>
            <div className={`rounded-lg border p-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <p className={`text-xs font-semibold uppercase ${isDark ? "text-gray-500" : "text-slate-400"}`}>Questions</p>
              <p className={`mt-1 font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{questions.length} questions</p>
            </div>
            <div className={`rounded-lg border p-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <p className={`text-xs font-semibold uppercase ${isDark ? "text-gray-500" : "text-slate-400"}`}>Total Points</p>
              <p className={`mt-1 font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{examMeta?.totalPoints || 100} points</p>
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
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className={`w-full max-w-md rounded-xl border p-6 shadow-sm ${
          isDark ? "bg-slate-900 border-red-500/30" : "bg-white border-red-200"
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" size={24} />
            <h2 className={`text-lg font-semibold ${isDark ? "text-red-400" : "text-red-700"}`}>Error</h2>
          </div>
          <p className={`text-sm mb-4 ${isDark ? "text-red-400" : "text-red-600"}`}>{error}</p>
          <Link
            to="/student/assignments"
            className={`inline-flex items-center gap-2 text-sm ${
              isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
            }`}
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
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      {/* HEADER */}
      <header className={`border-b px-8 py-4 ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
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
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>EXAMORA</span>
            </button>

            {/* Secure Session Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${
              isDark ? "bg-emerald-500/20 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"
            }`}>
              <Shield size={14} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
              <span className={`text-xs font-semibold tracking-wide ${
                isDark ? "text-emerald-400" : "text-emerald-700"
              }`}>SECURE SESSION</span>
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
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition border rounded-xl ${
                isDark
                  ? "text-gray-300 hover:text-white border-white/10 hover:bg-white/5"
                  : "text-slate-600 hover:text-slate-900 border-slate-200"
              }`}
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
        <aside className={`w-72 rounded-2xl border-2 border-dashed border-blue-500/60 p-5 flex flex-col gap-5 overflow-y-auto ${
          isDark ? "bg-slate-900" : "bg-white"
        }`}>
          {/* Exam Progress */}
          <div>
            <h3 className={`text-base font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Exam Progress</h3>
            <p className={`text-xs mb-3 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Computer Science • Algorithms</p>
            <div className="flex items-center justify-between text-sm font-semibold mb-1">
              <span className={isDark ? "text-blue-400" : "text-blue-600"}>{answeredCount} / {totalQuestions} Completed</span>
              <span className={isDark ? "text-blue-400" : "text-blue-600"}>{progressPercent}%</span>
            </div>
            <div className={`h-1.5 rounded-full ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
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
                        : isDark
                        ? "bg-white/5 text-gray-400 hover:bg-white/10"
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
              <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>Flagged for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isDark ? "bg-white/10" : "bg-slate-300"}`}></div>
              <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>Unanswered</span>
            </div>
          </div>

          {/* Proctor Status */}
          <div className="mt-auto">
            <div className={`border rounded-xl p-4 ${
              isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Eye size={16} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                <span className={`text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>Proctor Status</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center gap-2 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Camera Active
                </div>
                <div className={`flex items-center gap-2 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Microphone Active
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN EXAM AREA */}
        <main className={`flex-1 rounded-2xl border-2 border-dashed border-blue-500/60 flex flex-col ${
          isDark ? "bg-slate-900" : "bg-white"
        }`}>
          {/* Question Header */}
          <div className={`px-8 pt-6 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                  isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
                }`}>
                  Section 1: Data Structures
                </span>
                <span className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                  Question {currentQuestion ? currentQuestion.displayIndex : "-"} of {totalQuestions}
                </span>
              </div>
              <button
                onClick={() => currentQuestion && handleToggleFlag(currentQuestion.questionId)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  currentQuestion && flaggedQuestions.has(currentQuestion.questionId)
                    ? isDark
                      ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                      : "bg-amber-50 border-amber-300 text-amber-700"
                    : isDark
                    ? "bg-slate-800 border-white/10 text-gray-300 hover:bg-white/5"
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
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
              Question {currentQuestion ? currentQuestion.displayIndex : "-"}
            </h2>
            <p className={`text-base leading-relaxed mb-8 ${isDark ? "text-gray-200" : "text-slate-800"}`}>
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
                        ? isDark
                          ? "border-blue-500 bg-blue-500/10 shadow-sm"
                          : "border-blue-500 bg-white shadow-sm"
                        : isDark
                        ? "border-white/10 bg-slate-800 hover:border-white/20 hover:bg-slate-700"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                        isSelected
                          ? isDark
                            ? "border-blue-500 bg-blue-500/20 text-blue-400"
                            : "border-blue-500 bg-white text-blue-600"
                          : isDark
                          ? "border-white/20 bg-slate-700 text-gray-300"
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
                    <span className={`text-sm ${isDark ? "text-gray-200" : "text-slate-800"}`}>{answer.content}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className={`border-t px-8 py-4 flex items-center justify-between ${
            isDark ? "border-white/10" : "border-slate-100"
          }`}>
            <button
              type="button"
              onClick={handlePrevious}
              disabled={activeQuestionIndex === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isDark
                  ? "bg-amber-500/10 border-amber-500/30 text-gray-300 hover:bg-amber-500/20"
                  : "bg-amber-50 border-amber-200 text-slate-700 hover:bg-amber-100"
              }`}
            >
              <ChevronLeft size={16} />
              Previous Question
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={!currentQuestion || !selectedAnswers[currentQuestion.questionId]}
                className={`inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                  isDark
                    ? "bg-white/5 text-gray-300 hover:bg-white/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
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
        <aside className={`w-16 rounded-2xl border-2 border-dashed border-blue-500/60 flex flex-col items-center py-4 gap-3 ${
          isDark ? "bg-slate-900" : "bg-white"
        }`}>
          <button
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition ${
              isDark ? "text-gray-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
            }`}
            title="Calculator"
          >
            <Calculator size={20} />
          </button>
          <button
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition ${
              isDark ? "text-gray-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
            }`}
            title="Code Editor"
          >
            <Code size={20} />
          </button>
          <button
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition ${
              isDark ? "text-gray-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
            }`}
            title="Formula Book"
          >
            <Book size={20} />
          </button>
          <div className="flex-1"></div>
          <button
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition ${
              isDark ? "text-gray-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
            }`}
            title="Help"
          >
            <HelpCircle size={20} />
          </button>
        </aside>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${
            isDark ? "bg-slate-900 border border-white/10" : "bg-white"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? "bg-amber-500/20" : "bg-amber-100"
              }`}>
                <AlertCircle className={isDark ? "text-amber-400" : "text-amber-600"} size={24} />
              </div>
              <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Submit Exam?</h2>
            </div>
            <div className={`mb-6 space-y-2 text-sm ${isDark ? "text-gray-300" : "text-slate-600"}`}>
              <p>You have answered <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{answeredCount}</span> out of <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{totalQuestions}</span> questions.</p>
              {unansweredCount > 0 && (
                <p className={isDark ? "text-amber-400" : "text-amber-600"}>You have <span className="font-semibold">{unansweredCount}</span> unanswered questions.</p>
              )}
              {flaggedCount > 0 && (
                <p className={isDark ? "text-blue-400" : "text-blue-600"}>You have <span className="font-semibold">{flaggedCount}</span> questions flagged for review.</p>
              )}
              <p className={isDark ? "text-gray-400" : "text-slate-500"}>This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                  isDark
                    ? "border-white/10 text-gray-300 hover:bg-white/5"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
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