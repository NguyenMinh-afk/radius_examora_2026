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
import { LoadingState, ErrorState } from "../../../components/teacher/shared";

interface QuestionDetail {
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

const TeacherExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Question picker modal
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterType, setFilterType] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState<QuestionDetail[]>([]);
  const [selectedForAdd, setSelectedForAdd] = useState<Set<string>>(new Set());

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ 
    title: "", 
    description: "",
    duration: 60,
    passingScore: 0
  });

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
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterDifficulty) params.append("difficulty", filterDifficulty);
      if (filterType) params.append("questionType", filterType);

      const response = await fetch(
        `http://localhost:3002/api/questions?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        const data: { items: QuestionServiceQuestion[] } = await response.json();
        setAvailableQuestions(
          data.items.map((q: QuestionServiceQuestion) => ({
            id: q.id,
            questionId: q.id,
            content: q.content,
            questionType: q.questionType,
            difficulty: q.difficulty,
            points: 1,
            answers: q.answers || [],
          }))
        );
      }
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
        <LoadingState size="lg" text="Đang tải chi tiết đề thi..." />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="p-8">
        <ErrorState
          message={error || "Không tìm thấy đề thi"}
          onRetry={fetchExamDetail}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/teacher/exams")}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                exam.published
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {exam.published ? "Đã xuất bản" : "Bản nháp"}
            </span>
          </div>
          {exam.description && (
            <p className="text-sm text-slate-500 mt-1">{exam.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition flex items-center gap-2"
          >
            <Edit2 size={16} />
            Chỉnh sửa
          </button>
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              exam.published
                ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {exam.published ? "Hủy xuất bản" : "Xuất bản"}
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2">
            <Eye size={16} />
            Preview
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckSquare size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{questions.length}</p>
              <p className="text-sm text-slate-500">Câu hỏi</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalPoints}</p>
              <p className="text-sm text-slate-500">Tổng điểm</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{exam.duration}</p>
              <p className="text-sm text-slate-500">Phút</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{exam.passingScore}</p>
              <p className="text-sm text-slate-500">Điểm đạt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Danh sách câu hỏi</h2>
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
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 mb-4">Chưa có câu hỏi nào trong đề thi</p>
            <button
              onClick={handleOpenPicker}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Thêm câu hỏi
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 flex items-start gap-4">
                <GripVertical
                  size={18}
                  className="text-slate-300 cursor-grab mt-1"
                />
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600 flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{question.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded">
                      {QUESTION_TYPES.find((t) => t.value === question.questionType)
                        ?.label || question.questionType}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        DIFFICULTIES.find((d) => d.value === question.difficulty)
                          ?.color || "bg-slate-100"
                      }`}
                    >
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
                      className="w-16 px-2 py-1 text-sm border border-slate-200 rounded text-center"
                      min={0}
                      step={0.5}
                    />
                    <span className="text-sm text-slate-500">điểm</span>
                  </div>
                  <button
                    onClick={() =>
                      handleRemoveQuestion(question.id, question.questionId)
                    }
                    className="p-2 rounded hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Picker Modal */}
      {showQuestionPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowQuestionPicker(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Thêm câu hỏi vào đề thi</h2>
              <button
                onClick={() => setShowQuestionPicker(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            {pickerError && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {pickerError}
              </div>
            )}

            {/* Search */}
            <div className="p-4 border-b border-slate-100 flex gap-3">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm câu hỏi..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg"
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
                className="px-4 py-2 border border-slate-200 rounded-lg"
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

            {/* Selected count */}
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <span className="text-sm text-blue-700">
                Đã chọn: <strong>{selectedForAdd.size}</strong> câu hỏi
              </span>
            </div>

            {/* Questions list */}
            <div className="flex-1 overflow-y-auto p-4">
              {pickerLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin text-blue-600"
                  />
                </div>
              ) : availableQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText
                    size={48}
                    className="mx-auto mb-4 text-slate-300"
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
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                            selectedForAdd.has(question.id)
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300"
                          }`}
                        >
                          {selectedForAdd.has(question.id) && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {question.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded">
                              {QUESTION_TYPES.find(
                                (t) => t.value === question.questionType
                              )?.label || question.questionType}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                DIFFICULTIES.find(
                                  (d) => d.value === question.difficulty
                                )?.color || "bg-slate-100"
                              }`}
                            >
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

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowQuestionPicker(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">Chỉnh sửa đề thi</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên đề thi
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editData.duration}
                    onChange={(e) =>
                      setEditData({ ...editData, duration: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
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
    </div>
  );
};

export default TeacherExamDetailPage;
