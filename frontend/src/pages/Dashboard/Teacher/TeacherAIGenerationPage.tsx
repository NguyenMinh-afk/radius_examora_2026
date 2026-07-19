import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Upload,
  FileText,
  X,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  Trash2,
  Zap,
  Settings,
  History,
} from "lucide-react";
import { useTheme } from "../../../contexts/useTheme";
import {
  createGenerationRequest,
  getGenerationHistory,
  getGenerationRequestStatus,
  type GenerationHistoryItem,
  type CreateGenerationPayload,
} from "../../../api/aiApi";
import { getCourses, type Course } from "../../../api/teacherApi";

type Tab = "create" | "history";

const difficultyOptions = [
  { value: "easy", label: "Dễ", color: "text-emerald-500 bg-emerald-500/10" },
  { value: "medium", label: "Trung bình", color: "text-amber-500 bg-amber-500/10" },
  { value: "hard", label: "Khó", color: "text-orange-500 bg-orange-500/10" },
  { value: "very_hard", label: "Rất khó", color: "text-red-500 bg-red-500/10" },
];

const questionTypeOptions = [
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "true_false", label: "Đúng/Sai" },
  { value: "fill_blank", label: "Điền khuyết" },
  { value: "matching", label: "Nối cột" },
];

const TeacherAIGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<Tab>("create");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>();
  const [context, setContext] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [quantity, setQuantity] = useState(10);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // History & Status
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Poll status when there's an active request
  useEffect(() => {
    if (!currentRequestId || currentStatus === "completed" || currentStatus === "failed") {
      return;
    }

    const pollStatus = async () => {
      try {
        const status = await getGenerationRequestStatus(currentRequestId);
        setCurrentStatus(status.status);
        setCurrentProgress(status.progress);
        setStatusError(status.errorMessage);
      } catch (err) {
        console.error("Failed to poll status:", err);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [currentRequestId, currentStatus]);

  // Load history
  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const data = await getGenerationHistory(50);
      setHistory(data.items);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ["pdf", "docx", "doc", "txt"].includes(ext || "");
    });
    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!context.trim() && uploadedFiles.length === 0) {
      setError("Vui lòng nhập nội dung hoặc tải lên tài liệu");
      return;
    }

    if (quantity < 1 || quantity > 50) {
      setError("Số lượng câu hỏi phải từ 1 đến 50");
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateGenerationPayload = {
        courseId: selectedCourseId,
        questionType,
        difficulty,
        quantity,
        context: context.trim() || undefined,
      };

      const result = await createGenerationRequest(payload);
      setCurrentRequestId(result.requestId);
      setCurrentStatus(result.status);
      setCurrentProgress(0);
      setSuccess(`Đã gửi yêu cầu tạo ${quantity} câu hỏi! Đang xử lý...`);

      // Reset form
      setContext("");
      setUploadedFiles([]);
      setActiveTab("history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi yêu cầu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-500/20 text-slate-400">
            <Clock size={12} /> Đang chờ
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-blue-500/20 text-blue-400">
            <Loader2 size={12} className="animate-spin" /> Đang xử lý
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 size={12} /> Hoàn thành
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-red-500/20 text-red-400">
            <AlertCircle size={12} /> Thất bại
          </span>
        );
      default:
        return null;
    }
  };

  const getDifficultyBadge = (diff: string | null) => {
    const option = difficultyOptions.find((o) => o.value === diff);
    if (!option) return null;
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${option.color}`}>
        {option.label}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"
          }`}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Tạo câu hỏi bằng AI
            </h1>
            <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              Sử dụng AI để tự động tạo câu hỏi trắc nghiệm từ nội dung học tập
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl mb-6 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "create"
              ? isDark ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
              : isDark ? "text-gray-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Zap size={16} />
          Tạo mới
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "history"
              ? isDark ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
              : isDark ? "text-gray-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History size={16} />
          Lịch sử
        </button>
      </div>

      {/* Create Tab */}
      {activeTab === "create" && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Context Input */}
              <div className={`rounded-2xl border shadow-sm ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
                <div className={`border-b px-6 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"
                    }`}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        Nội dung học tập
                      </h2>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                        Nhập nội dung hoặc tải lên tài liệu để AI tạo câu hỏi
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Nhập nội dung bài học, chương trình giảng dạy, hoặc mô tả chủ đề bạn muốn tạo câu hỏi..."
                    className={`min-h-[200px] w-full rounded-xl border p-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      isDark
                        ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className={`rounded-2xl border shadow-sm ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
                <div className={`border-b px-6 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      <Upload size={16} />
                    </div>
                    <div>
                      <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        Tải lên tài liệu
                      </h2>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                        Hỗ trợ PDF, DOCX, DOC, TXT (tối đa 20MB)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <label
                    className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition hover:border-blue-400 ${
                      isDark
                        ? "border-white/10 bg-slate-800/50 hover:bg-slate-800"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                    }`}>
                      <Upload size={24} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-700"}`}>
                        Kéo thả file vào đây hoặc click để chọn
                      </p>
                      <p className={`mt-1 text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                        PDF, DOCX, DOC, TXT
                      </p>
                    </div>
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between rounded-lg p-3 ${
                            isDark ? "bg-slate-800" : "bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={16} className={isDark ? "text-gray-400" : "text-slate-500"} />
                            <span className={`text-sm ${isDark ? "text-white" : "text-slate-700"}`}>
                              {file.name}
                            </span>
                            <span className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className={`p-1.5 rounded-lg transition ${
                              isDark
                                ? "text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                                : "text-slate-400 hover:bg-red-50 hover:text-red-600"
                            }`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              {/* Configuration */}
              <div className={`rounded-2xl border shadow-sm ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
                <div className={`border-b px-6 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-600"
                    }`}>
                      <Settings size={16} />
                    </div>
                    <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Cấu hình
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {/* Course */}
                  <div>
                    <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                      Môn học
                    </label>
                    <select
                      value={selectedCourseId || ""}
                      onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : undefined)}
                      className={`w-full rounded-lg border p-2.5 text-sm outline-none transition focus:border-blue-500 ${
                        isDark
                          ? "bg-slate-800 border-white/10 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <option value="">Chọn môn học...</option>
                      {courses.map((course) => (
                        <option key={course.courseId} value={course.courseId}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                      Loại câu hỏi
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className={`w-full rounded-lg border p-2.5 text-sm outline-none transition focus:border-blue-500 ${
                        isDark
                          ? "bg-slate-800 border-white/10 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {questionTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                      Độ khó
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {difficultyOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDifficulty(opt.value)}
                          className={`rounded-lg border p-2 text-xs font-medium transition ${
                            difficulty === opt.value
                              ? `${opt.color} border-transparent`
                              : isDark
                                ? "border-white/10 text-gray-400 hover:border-white/20"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                      Số lượng câu hỏi (1-50)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className={`w-full rounded-lg border p-2.5 text-sm outline-none transition focus:border-blue-500 ${
                        isDark
                          ? "bg-slate-800 border-white/10 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Tạo câu hỏi
                  </>
                )}
              </button>

              {/* Error/Success Messages */}
              {error && (
                <div className={`rounded-xl border p-4 text-sm ${
                  isDark
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                </div>
              )}

              {success && (
                <div className={`rounded-xl border p-4 text-sm ${
                  isDark
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    {success}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className={`rounded-2xl border shadow-sm ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
          <div className={`border-b px-6 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Lịch sử tạo câu hỏi
            </h2>
          </div>
          <div className="p-6">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className={`animate-spin ${isDark ? "text-gray-400" : "text-slate-400"}`} />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  isDark ? "bg-slate-800 text-gray-500" : "bg-slate-100 text-slate-400"
                }`}>
                  <History size={24} />
                </div>
                <p className={`mt-4 text-sm font-medium ${isDark ? "text-gray-400" : "text-slate-600"}`}>
                  Chưa có yêu cầu nào
                </p>
                <p className={`mt-1 text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                  Các yêu cầu tạo câu hỏi AI sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-xl p-4 transition ${
                      isDark
                        ? "bg-slate-800/50 hover:bg-slate-800"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"
                      }`}>
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                          Tạo {item.quantity} câu hỏi
                          {item.difficulty && ` - ${difficultyOptions.find(d => d.value === item.difficulty)?.label}`}
                        </p>
                        <p className={`mt-0.5 text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                          {item.completedAt && ` • Hoàn thành: ${new Date(item.completedAt).toLocaleString("vi-VN")}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getDifficultyBadge(item.difficulty)}
                      {getStatusBadge(item.status)}
                      {item.status === "completed" && (
                        <button
                          onClick={() => navigate("/teacher/questions")}
                          className={`p-2 rounded-lg transition ${
                            isDark
                              ? "text-blue-400 hover:bg-blue-500/20"
                              : "text-blue-600 hover:bg-blue-50"
                          }`}
                          title="Xem câu hỏi"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAIGenerationPage;
