import {
  Award,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  GripVertical,
  Loader2,
  Search,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { Exam, ExamDetail } from "../../../api/teacherApi";
import { addExamQuestions, createExam, getExamQuestions } from "../../../api/teacherApi";

interface ExamBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  exam?: ExamDetail;
  onSuccess: (exam: Exam) => void;
}

interface ExamInfo {
  title: string;
  description: string;
  courseId: number | null;
  examType: string;
  duration: number;
  passingScore: number;
  yearLevel: string;
  published: boolean;
}

interface SelectedQuestion {
  id: string;
  questionId: string;
  content: string;
  questionType: string;
  difficulty: string;
  points: number;
  answers: Array<{ content: string; isCorrect: boolean }>;
}

interface QuestionServiceQuestion {
  id: string;
  content: string;
  questionType: string;
  difficulty: string;
  answers: Array<{ content: string; isCorrect: boolean }>;
}

interface AxiosErrorWithResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

const EXAM_TYPES = [
  { value: "midterm", label: "Giữa kỳ" },
  { value: "final", label: "Cuối kỳ" },
  { value: "quiz", label: "Quiz" },
  { value: "homework", label: "Bài tập" },
  { value: "practice", label: "Thực hành" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Dễ", color: "text-green-600 bg-green-50" },
  { value: "medium", label: "Trung bình", color: "text-yellow-600 bg-yellow-50" },
  { value: "hard", label: "Khó", color: "text-red-600 bg-red-50" },
];

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "true_false", label: "Đúng/Sai" },
  { value: "short_answer", label: "Trả lời ngắn" },
  { value: "essay", label: "Tự luận" },
];

const ExamBuilderWizard: React.FC<ExamBuilderWizardProps> = ({
  isOpen,
  onClose,
  mode,
  exam,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examId, setExamId] = useState<string | null>(null);

  const [examInfo, setExamInfo] = useState<ExamInfo>({
    title: "",
    description: "",
    courseId: null,
    examType: "midterm",
    duration: 60,
    passingScore: 5,
    yearLevel: "",
    published: false,
  });

  // Question picker state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterType, setFilterType] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState<SelectedQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Selected questions list state
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);

  // Review state
  const [createdExam, setCreatedExam] = useState<Exam | null>(null);

  useEffect(() => {
    if (mode === "edit" && exam) {
      setExamInfo({
        title: exam.title,
        description: exam.description || "",
        courseId: exam.courseId,
        examType: "midterm",
        duration: exam.duration,
        passingScore: exam.passingScore,
        yearLevel: "",
        published: exam.published,
      });
      setExamId(exam.examId);
      // Load existing questions
      loadExistingQuestions(exam.examId);
    } else {
      setStep(1);
      setExamInfo({
        title: "",
        description: "",
        courseId: null,
        examType: "midterm",
        duration: 60,
        passingScore: 5,
        yearLevel: "",
        published: false,
      });
      setSelectedQuestions([]);
      setExamId(null);
    }
    setError(null);
  }, [mode, exam, isOpen]);

  const loadExistingQuestions = async (id: string) => {
    try {
      setLoadingQuestions(true);
      const data = await getExamQuestions(id);
      // Map exam questions to selected questions format
      const mappedQuestions: SelectedQuestion[] = data.questions.map((eq, index: number) => ({
        id: eq.questionId,
        questionId: eq.questionId,
        content: `Câu hỏi ${index + 1}`,
        questionType: "multiple_choice",
        difficulty: "medium",
        points: eq.points || 1,
        answers: [],
      }));
      setSelectedQuestions(mappedQuestions);
      
      // Also set selectedQuestionIds so questions appear selected in picker
      setSelectedQuestionIds(new Set(mappedQuestions.map((q: SelectedQuestion) => q.id)));
    } catch (err) {
      console.error("Failed to load exam questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterDifficulty) params.append("difficulty", filterDifficulty);
      if (filterType) params.append("questionType", filterType);

      const response = await fetch(`http://localhost:3002/api/questions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        const data: { items: QuestionServiceQuestion[] } = await response.json();
        const questions = data.items.map((q: QuestionServiceQuestion) => ({
          id: q.id,
          questionId: q.id,
          content: q.content,
          questionType: q.questionType,
          difficulty: q.difficulty,
          points: 1,
          answers: q.answers || [],
        }));
        setAvailableQuestions(questions);
      }
    } catch (_err) {
      console.error("Failed to fetch questions:", _err);
    } finally {
      setLoadingQuestions(false);
    }
  }, [searchQuery, filterDifficulty, filterType]);

  useEffect(() => {
    if (step === 2) {
      fetchQuestions();
    }
  }, [step, fetchQuestions]);

  const handleSelectQuestion = (question: SelectedQuestion) => {
    setSelectedQuestionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(question.id)) {
        newSet.delete(question.id);
      } else {
        newSet.add(question.id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestionIds.size === availableQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(availableQuestions.map((q) => q.id)));
    }
  };

  const handleRandomSelect = (count: number, difficulty?: string) => {
    let pool = availableQuestions;
    if (difficulty) {
      pool = availableQuestions.filter((q) => q.difficulty === difficulty);
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count).map((q) => q.id);
    setSelectedQuestionIds(new Set(selected));
  };

  const handleNextFromStep1 = () => {
    if (!examInfo.title.trim()) {
      setError("Vui lòng nhập tên đề thi");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleNextFromStep2 = async () => {
    if (selectedQuestionIds.size === 0) {
      setError("Vui lòng chọn ít nhất một câu hỏi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Merge: giữ points cũ nếu đã load từ DB, dùng points mới nếu là câu mới
      const selected = availableQuestions
        .filter((q) => selectedQuestionIds.has(q.id))
        .map((q) => {
          const existing = selectedQuestions.find((sq) => sq.id === q.id);
          return {
            ...q,
            points: existing ? existing.points : q.points,
          };
        });
      setSelectedQuestions(selected);

      // Create exam if in create mode
      if (mode === "create" || !examId) {
        const examPayload = {
          title: examInfo.title,
          description: examInfo.description,
          duration: examInfo.duration,
          totalPoints: selected.reduce((sum, q) => sum + q.points, 0),
          passingScore: examInfo.passingScore,
        };
        const result = await createExam(examPayload);
        setExamId(result.examId);
        setCreatedExam(result);

        // Add questions to exam
        await addExamQuestions(result.examId, {
          questionIds: Array.from(selectedQuestionIds),
          defaultPoints: 1.0,
        });
      }

      setStep(3);
    } catch (err) {
      const axiosErr = err as AxiosErrorWithResponse;
      setError(axiosErr.response?.data?.error || axiosErr.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleNextFromStep3 = () => {
    setStep(4);
  };

  const handleUpdatePoints = (questionId: string, points: number) => {
    setSelectedQuestions((prev) =>
      prev.map((q) => (q.questionId === questionId ? { ...q, points } : q))
    );
  };

  const handleRemoveQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
    setSelectedQuestionIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedQuestions.length) return;

    setSelectedQuestions((prev) => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const handleFinish = () => {
    if (createdExam) {
      onSuccess(createdExam);
    }
    onClose();
  };

  const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Wizard Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {mode === "create" ? "Tạo đề thi mới" : "Chỉnh sửa đề thi"}
              </h2>
              <p className="text-sm text-slate-500">
                Bước {step} / 4:{" "}
                {step === 1 && "Thông tin đề thi"}
                {step === 2 && "Chọn câu hỏi"}
                {step === 3 && "Sắp xếp câu hỏi"}
                {step === 4 && "Review & Hoàn tất"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition ${
                  s <= step ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Step 1: Exam Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tên đề thi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examInfo.title}
                  onChange={(e) => setExamInfo({ ...examInfo, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Giữa kỳ - Toán cao cấp A1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  value={examInfo.description}
                  onChange={(e) => setExamInfo({ ...examInfo, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Mô tả nội dung đề thi, thời gian làm bài..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Loại đề thi
                  </label>
                  <select
                    value={examInfo.examType}
                    onChange={(e) => setExamInfo({ ...examInfo, examType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {EXAM_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    value={examInfo.duration}
                    onChange={(e) =>
                      setExamInfo({ ...examInfo, duration: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Điểm đạt (thang 10)
                  </label>
                  <input
                    type="number"
                    value={examInfo.passingScore}
                    onChange={(e) =>
                      setExamInfo({ ...examInfo, passingScore: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min={0}
                    max={10}
                    step={0.5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Năm học
                  </label>
                  <input
                    type="text"
                    value={examInfo.yearLevel}
                    onChange={(e) => setExamInfo({ ...examInfo, yearLevel: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="VD: 2024-2025"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Xuất bản đề thi</p>
                  <p className="text-xs text-slate-500">Đề thi sẽ có thể được giao cho học sinh</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examInfo.published}
                    onChange={(e) => setExamInfo({ ...examInfo, published: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Question Picker */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm câu hỏi..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Mọi độ khó</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Mọi loại</option>
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  {selectedQuestionIds.size === availableQuestions.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
                <button
                  onClick={() => handleRandomSelect(10)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Random 10 câu
                </button>
                <button
                  onClick={() => handleRandomSelect(5, "easy")}
                  className="px-3 py-1.5 text-sm border border-green-200 text-green-600 rounded-lg hover:bg-green-50"
                >
                  Random 5 câu Dễ
                </button>
                <button
                  onClick={() => handleRandomSelect(5, "medium")}
                  className="px-3 py-1.5 text-sm border border-yellow-200 text-yellow-600 rounded-lg hover:bg-yellow-50"
                >
                  Random 5 câu TB
                </button>
                <button
                  onClick={() => handleRandomSelect(5, "hard")}
                  className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Random 5 câu Khó
                </button>
              </div>

              {/* Selected Count */}
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  Đã chọn: <strong>{selectedQuestionIds.size}</strong> câu hỏi
                </span>
                <span className="text-sm text-blue-700">
                  Tổng điểm: <strong>{selectedQuestionIds.size}</strong> điểm
                </span>
              </div>

              {/* Questions List */}
              {loadingQuestions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                </div>
              ) : availableQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>Không tìm thấy câu hỏi nào</p>
                  <p className="text-sm mt-1">Hãy thử điều chỉnh bộ lọc hoặc tạo câu hỏi mới</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableQuestions.map((question) => (
                    <div
                      key={question.id}
                      onClick={() => handleSelectQuestion(question)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedQuestionIds.has(question.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                            selectedQuestionIds.has(question.id)
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300"
                          }`}
                        >
                          {selectedQuestionIds.has(question.id) && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 line-clamp-2">{question.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded">
                              {QUESTION_TYPES.find((t) => t.value === question.questionType)?.label ||
                                question.questionType}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                DIFFICULTIES.find((d) => d.value === question.difficulty)?.color ||
                                "bg-slate-100"
                              }`}
                            >
                              {DIFFICULTIES.find((d) => d.value === question.difficulty)?.label ||
                                question.difficulty}
                            </span>
                            <span className="text-xs text-slate-500">{question.points} điểm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Question List Management */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-700">
                  Danh sách câu hỏi ({selectedQuestions.length} câu)
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">
                    Tổng điểm: <strong className="text-blue-600">{totalPoints}</strong>
                  </span>
                  <span className="text-slate-500">
                    Thời lượng: <strong className="text-blue-600">{examInfo.duration} phút</strong>
                  </span>
                </div>
              </div>

              {selectedQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>Chưa có câu hỏi nào được chọn</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {selectedQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-white"
                    >
                      <GripVertical size={18} className="text-slate-300 cursor-grab" />
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 line-clamp-2">{question.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              DIFFICULTIES.find((d) => d.value === question.difficulty)?.color ||
                              "bg-slate-100"
                            }`}
                          >
                            {DIFFICULTIES.find((d) => d.value === question.difficulty)?.label ||
                              question.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) =>
                              handleUpdatePoints(question.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 text-sm border border-slate-200 rounded text-center"
                            min={0}
                            step={0.5}
                          />
                          <span className="text-sm text-slate-500">điểm</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveQuestion(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => handleMoveQuestion(index, "down")}
                            disabled={index === selectedQuestions.length - 1}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="p-1 rounded hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{examInfo.title}</h3>
                {examInfo.description && (
                  <p className="text-blue-100 text-sm">{examInfo.description}</p>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <CheckSquare size={24} className="mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-slate-900">{selectedQuestions.length}</p>
                  <p className="text-sm text-slate-500">Câu hỏi</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <Award size={24} className="mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-slate-900">{totalPoints}</p>
                  <p className="text-sm text-slate-500">Tổng điểm</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <Clock size={24} className="mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold text-slate-900">{examInfo.duration}</p>
                  <p className="text-sm text-slate-500">Phút</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <FileText size={24} className="mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-slate-900">
                    {EXAM_TYPES.find((t) => t.value === examInfo.examType)?.label}
                  </p>
                  <p className="text-sm text-slate-500">Loại đề</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Eye size={20} className="text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Điểm đạt: {examInfo.passingScore}/10</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Sinh viên cần đạt tối thiểu {examInfo.passingScore} điểm để vượt qua bài thi này.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-700 mb-3">Danh sách câu hỏi</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedQuestions.map((q, index) => (
                    <div key={q.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm text-slate-700 line-clamp-1">{q.content}</span>
                      <span className="text-sm font-medium text-slate-600">{q.points} điểm</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition flex items-center gap-2"
          >
            {step === 1 ? "Hủy" : (
              <>
                <ChevronLeft size={18} />
                Quay lại
              </>
            )}
          </button>

          {step < 4 ? (
            <button
              onClick={
                step === 1
                  ? handleNextFromStep1
                  : step === 2
                  ? handleNextFromStep2
                  : handleNextFromStep3
              }
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Tiếp tục
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
            >
              <Check size={18} />
              Hoàn tất
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamBuilderWizard;
