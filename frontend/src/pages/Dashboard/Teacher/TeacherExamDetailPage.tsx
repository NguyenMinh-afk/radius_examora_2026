import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Award,
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Search,
  GripVertical,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  getExamDetail,
  updateExam,
  getExamQuestions,
  addExamQuestions,
  removeExamQuestion,
  updateExamQuestion,
  type ExamDetail,
  type ExamQuestionItem,
} from "../../../api/teacherApi";
import { getQuestions, type QuestionItem } from "../../../api/questionApi";
import { LoadingState, ErrorState } from "../../../components/teacher/shared";
import { useTheme } from "../../../contexts/useTheme";

interface QuestionDetail {
  id: string;
  questionId: string;
  content: string;
  questionType: string;
  difficulty: string;
  points: number;
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

const DIFFICULTIES = [
  { value: "easy", label: "Dễ", colorLight: "text-green-600 bg-green-50", colorDark: "text-emerald-400 bg-emerald-500/20" },
  { value: "medium", label: "Trung bình", colorLight: "text-yellow-600 bg-yellow-50", colorDark: "text-amber-400 bg-amber-500/20" },
  { value: "hard", label: "Khó", colorLight: "text-red-600 bg-red-50", colorDark: "text-red-400 bg-red-500/20" },
];

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "true_false", label: "Đúng/Sai" },
  { value: "short_answer", label: "Trả lời ngắn" },
  { value: "essay", label: "Tự luận" },
];

const TeacherExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterType, setFilterType] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState<QuestionDetail[]>([]);
  const [selectedForAdd, setSelectedForAdd] = useState<Set<string>>(new Set());

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    duration: 60,
    passingScore: 0
  });

  const getDifficultyColor = (value: string) => {
    const d = DIFFICULTIES.find((x) => x.value === value);
    if (!d) return isDark ? "bg-slate-800 text-gray-300" : "bg-slate-100";
    return isDark ? d.colorDark : d.colorLight;
  };

  const fetchExamDetail = useCallback(async () => {
    if (!examId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getExamDetail(examId);
      setExam(data);
      setEditData({
        title: data.title,
        description: data.description || "",
        duration: data.duration,
        passingScore: data.passingScore
      });
    } catch (err) {
      const axiosErr = err as AxiosErrorWithResponse;
      setError(axiosErr.response?.data?.error || axiosErr.message || "Không thể tải chi tiết đề thi");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const fetchExamQuestions = useCallback(async () => {
    if (!examId) return;
    try {
      const data = await getExamQuestions(examId);
      setQuestions(
        data.questions.map((q: ExamQuestionItem) => ({
          id: q.id,
          questionId: q.questionId,
          content: `Câu hỏi ${q.order}`,
          questionType: "multiple_choice",
          difficulty: "medium",
          points: q.points,
          answers: [],
        }))
      );
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    }
  }, [examId]);

  useEffect(() => {
    fetchExamDetail();
    fetchExamQuestions();
  }, [fetchExamDetail, fetchExamQuestions]);

  const fetchAvailableQuestions = async () => {
    setPickerLoading(true);
    setPickerError(null);
    try {
      const data = await getQuestions({
        search: searchQuery || undefined,
        difficulty: filterDifficulty || undefined,
      });
      setAvailableQuestions(
        data.items.map((q: QuestionItem) => ({
          id: q.id,
          questionId: q.id,
          content: q.content,
          questionType: q.questionType,
          difficulty: q.difficulty,
          points: q.points ?? 1,
          answers: q.answers || [],
        }))
      );
    } catch {
      setPickerError("Không thể tải danh sách câu hỏi");
    } finally {
      setPickerLoading(false);
    }
  };

  const handleOpenPicker = () => {
    setSelectedForAdd(new Set());
    setShowQuestionPicker(true);
    fetchAvailableQuestions();
  };

  const handleToggleSelectQuestion = (questionId: string) => {
    setSelectedForAdd((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleAddQuestions = async () => {
    if (selectedForAdd.size === 0 || !examId) return;

    try {
      await addExamQuestions(examId, {
        questionIds: Array.from(selectedForAdd),
        defaultPoints: 1.0,
      });
      setShowQuestionPicker(false);
      fetchExamQuestions();
      fetchExamDetail();
    } catch (err) {
      const axiosErr = err as AxiosErrorWithResponse;
      setPickerError(axiosErr.response?.data?.error || "Không thể thêm câu hỏi");
    }
  };

  const handleRemoveQuestion = async (examQuestionId: string, questionId: string) => {
    if (!examId || !window.confirm("Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?")) {
      return;
    }

    try {
      await removeExamQuestion(examId, questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== examQuestionId));
      fetchExamDetail();
    } catch (err) {
      const axiosErr = err as AxiosErrorWithResponse;
      alert(axiosErr.response?.data?.error || "Không thể xóa câu hỏi");
    }
  };

  const handleUpdatePoints = async (questionId: string, points: number) => {
    if (!examId) return;

    try {
      await updateExamQuestion(examId, questionId, { points });
      setQuestions((prev) =>
        prev.map((q) => (q.questionId === questionId ? { ...q, points } : q))
      );
      fetchExamDetail();
    } catch (err) {
      console.error("Failed to update points:", err);
    }
  };

  const handleSaveEdit = async () => {
    if (!examId || !editData.title.trim()) return;

    try {
      await updateExam(examId, {
        title: editData.title,
        description: editData.description,
        duration: editData.duration,
        passingScore: editData.passingScore,
        published: exam?.published,
      });
      setShowEditModal(false);
      fetchExamDetail();
    } catch (err) {
      const axiosErr = err as AxiosErrorWithResponse;
      alert(axiosErr.response?.data?.error || "Không thể lưu thay đổi");
    }
  };

  const handleTogglePublish = async () => {
    if (!examId || !exam) return;

    try {
      await updateExam(examId, {
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        passingScore: exam.passingScore,
        published: !exam.published,
      });
      fetchExamDetail();
    } catch (err) {
      const axiosErr = err as AxiosErrorWithResponse;
      alert(axiosErr.response?.data?.error || "Không thể cập nhật trạng thái");
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState size="lg" text="Đang tải chi tiết đề thi..." isDark={isDark} />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="p-8">
        <ErrorState
          message={error || "Không tìm thấy đề thi"}
          onRetry={fetchExamDetail}
          isDark={isDark}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/teacher/exams")}
          className={`p-2 rounded-lg transition ${
            isDark ? "hover:bg-slate-800 text-gray-400" : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{exam.title}</h1>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                exam.published
                  ? isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-green-100 text-green-700"
                  : isDark ? "bg-slate-700 text-gray-300" : "bg-slate-100 text-slate-600"
              }`}
            >
              {exam.published ? "Đã xuất bản" : "Bản nháp"}
            </span>
          </div>
          {exam.description && (
            <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{exam.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className={`px-4 py-2 border rounded-lg font-medium transition flex items-center gap-2 ${
              isDark
                ? "border-white/10 text-gray-200 hover:bg-slate-800"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Edit2 size={16} />
            Chỉnh sửa
          </button>
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              exam.published
                ? isDark
                  ? "border border-white/10 text-gray-200 hover:bg-slate-800"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {exam.published ? "Hủy xuất bản" : "Xuất bản"}
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={16} />
            Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className={`border rounded-xl p-4 ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
              <CheckSquare size={20} className={isDark ? "text-blue-400" : "text-blue-600"} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{questions.length}</p>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>Câu hỏi</p>
            </div>
          </div>
        </div>
        <div className={`border rounded-xl p-4 ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-emerald-500/20" : "bg-green-100"}`}>
              <Award size={20} className={isDark ? "text-emerald-400" : "text-green-600"} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{totalPoints}</p>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>Tổng điểm</p>
            </div>
          </div>
        </div>
        <div className={`border rounded-xl p-4 ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-amber-500/20" : "bg-orange-100"}`}>
              <Clock size={20} className={isDark ? "text-amber-400" : "text-orange-600"} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{exam.duration}</p>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>Phút</p>
            </div>
          </div>
        </div>
        <div className={`border rounded-xl p-4 ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`}>
              <FileText size={20} className={isDark ? "text-purple-400" : "text-purple-600"} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{exam.passingScore}</p>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>Điểm đạt</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`border rounded-xl ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <h2 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Danh sách câu hỏi</h2>
          <button
            onClick={handleOpenPicker}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={16} />
            Thêm câu hỏi
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
            <p className={`mb-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Chưa có câu hỏi nào trong đề thi</p>
            <button
              onClick={handleOpenPicker}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Thêm câu hỏi
            </button>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-100"}`}>
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 flex items-start gap-4">
                <GripVertical
                  size={18}
                  className={`cursor-grab mt-1 ${isDark ? "text-slate-600" : "text-slate-300"}`}
                />
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                  isDark ? "bg-slate-800 text-gray-300" : "bg-slate-100 text-slate-600"
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isDark ? "text-gray-200" : "text-slate-700"}`}>{question.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      isDark ? "bg-slate-800 text-gray-300" : "bg-slate-100"
                    }`}>
                      {QUESTION_TYPES.find((t) => t.value === question.questionType)
                        ?.label || question.questionType}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(question.difficulty)}`}>
                      {DIFFICULTIES.find((d) => d.value === question.difficulty)
                        ?.label || question.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        handleUpdatePoints(
                          question.questionId,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`w-16 px-2 py-1 text-sm border rounded text-center ${
                        isDark
                          ? "bg-slate-800 border-white/10 text-white"
                          : "bg-white border-slate-200"
                      }`}
                      min={0}
                      step={0.5}
                    />
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>điểm</span>
                  </div>
                  <button
                    onClick={() =>
                      handleRemoveQuestion(question.id, question.questionId)
                    }
                    className={`p-2 rounded transition ${
                      isDark
                        ? "hover:bg-red-500/20 text-red-400"
                        : "hover:bg-red-50 text-red-500"
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQuestionPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowQuestionPicker(false)}
          />
          <div className={`relative rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col ${
            isDark ? "bg-slate-900 border border-white/10" : "bg-white"
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : ""}`}>Thêm câu hỏi vào đề thi</h2>
              <button
                onClick={() => setShowQuestionPicker(false)}
                className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
              >
                ×
              </button>
            </div>

            {pickerError && (
              <div className={`mx-4 mt-4 p-3 border rounded-lg text-sm flex items-center gap-2 ${
                isDark
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}>
                <AlertCircle size={16} />
                {pickerError}
              </div>
            )}

            <div className={`p-4 border-b flex gap-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-slate-400"}`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm câu hỏi..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    isDark
                      ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500"
                      : "bg-white border-slate-200"
                  }`}
                />
              </div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className={`px-4 py-2 border rounded-lg ${
                  isDark
                    ? "bg-slate-800 border-white/10 text-white"
                    : "bg-white border-slate-200"
                }`}
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
                className={`px-4 py-2 border rounded-lg ${
                  isDark
                    ? "bg-slate-800 border-white/10 text-white"
                    : "bg-white border-slate-200"
                }`}
              >
                <option value="">Mọi loại</option>
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchAvailableQuestions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tìm kiếm
              </button>
            </div>

            <div className={`px-4 py-2 border-b ${
              isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100"
            }`}>
              <span className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                Đã chọn: <strong>{selectedForAdd.size}</strong> câu hỏi
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {pickerLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin text-blue-600"
                  />
                </div>
              ) : availableQuestions.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                  <FileText
                    size={48}
                    className={`mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`}
                  />
                  <p>Không tìm thấy câu hỏi nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableQuestions.map((question) => (
                    <div
                      key={question.id}
                      onClick={() => handleToggleSelectQuestion(question.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedForAdd.has(question.id)
                          ? isDark
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-blue-500 bg-blue-50"
                          : isDark
                            ? "border-white/10 hover:border-slate-600 bg-slate-800"
                            : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                            selectedForAdd.has(question.id)
                              ? "border-blue-600 bg-blue-600"
                              : isDark
                                ? "border-slate-600"
                                : "border-slate-300"
                          }`}
                        >
                          {selectedForAdd.has(question.id) && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm line-clamp-2 ${isDark ? "text-gray-200" : "text-slate-700"}`}>
                            {question.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              isDark ? "bg-slate-700 text-gray-300" : "bg-slate-100"
                            }`}>
                              {QUESTION_TYPES.find(
                                (t) => t.value === question.questionType
                              )?.label || question.questionType}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(question.difficulty)}`}>
                              {DIFFICULTIES.find(
                                (d) => d.value === question.difficulty
                              )?.label || question.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-4 border-t flex justify-end gap-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <button
                onClick={() => setShowQuestionPicker(false)}
                className={`px-4 py-2 border rounded-lg ${
                  isDark
                    ? "border-white/10 text-gray-200 hover:bg-slate-800"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Hủy
              </button>
              <button
                onClick={handleAddQuestions}
                disabled={selectedForAdd.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Thêm {selectedForAdd.size} câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEditModal(false)}
          />
          <div className={`relative rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 ${
            isDark ? "bg-slate-900 border border-white/10" : "bg-white"
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : ""}`}>Chỉnh sửa đề thi</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                  Tên đề thi
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    isDark
                      ? "bg-slate-800 border-white/10 text-white"
                      : "bg-white border-slate-200"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                  Mô tả
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                    isDark
                      ? "bg-slate-800 border-white/10 text-white"
                      : "bg-white border-slate-200"
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editData.duration}
                    onChange={(e) =>
                      setEditData({ ...editData, duration: parseInt(e.target.value) || 0 })
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      isDark
                        ? "bg-slate-800 border-white/10 text-white"
                        : "bg-white border-slate-200"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                    Điểm đạt
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editData.passingScore}
                    onChange={(e) =>
                      setEditData({ ...editData, passingScore: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      isDark
                        ? "bg-slate-800 border-white/10 text-white"
                        : "bg-white border-slate-200"
                    }`}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className={`px-4 py-2 border rounded-lg ${
                  isDark
                    ? "border-white/10 text-gray-200 hover:bg-slate-800"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${
            isDark ? "bg-slate-900 border border-white/10" : "bg-white"
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Xem trước đề thi</h3>
              <button
                onClick={() => setShowPreview(false)}
                className={`p-2 rounded-lg transition ${
                  isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
                }`}
              >
                <X size={20} className={isDark ? "text-gray-400" : "text-slate-500"} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-70px)]">
              <h4 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{exam.title}</h4>
              <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{exam.description}</p>

              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div key={q.id} className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                        isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                      }`}>
                        {index + 1}
                      </span>
                      <p className={`flex-1 ${isDark ? "text-white" : "text-slate-800"}`}>{q.content}</p>
                    </div>
                    <div className="space-y-2 ml-11">
                      {q.answers.map((answer, aIndex) => (
                        <div key={aIndex} className="flex items-center gap-2">
                          <span className={`w-5 h-5 border-2 rounded-full flex-shrink-0 ${
                            answer.isCorrect
                              ? isDark ? "bg-emerald-500 border-emerald-500" : "bg-green-500 border-green-500"
                              : isDark ? "border-slate-600" : "border-slate-300"
                          }`} />
                          <span className={`text-sm ${isDark ? "text-gray-200" : "text-slate-700"}`}>{answer.content}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-3 flex items-center gap-3 text-xs ml-11 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                      <span className={`px-2 py-0.5 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                        {q.difficulty === "easy" ? "Dễ" : q.difficulty === "medium" ? "Trung bình" : "Khó"}
                      </span>
                      <span>{q.points} điểm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherExamDetailPage;
