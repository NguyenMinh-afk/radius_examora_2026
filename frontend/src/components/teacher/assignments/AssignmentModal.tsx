import React, { useState, useEffect } from "react";
import { X, Save, Loader2, AlertTriangle } from "lucide-react";
import { getExams, getClasses } from "../../../api/teacherApi";
import type { Exam, ClassData } from "../../../api/teacherApi";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  examId: string;
  classId: string;
  startTime: string;
  endTime: string;
  maxAttempts: number;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);

  const [formData, setFormData] = useState<FormData>({
    examId: "",
    classId: "",
    startTime: "",
    endTime: "",
    maxAttempts: 1,
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [examsData, classesData] = await Promise.all([
        getExams(),
        getClasses(),
      ]);
      setExams(examsData);
      setClasses(classesData);
    } catch (err) {
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? parseInt(value) : 1) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.examId || !formData.classId || !formData.startTime || !formData.endTime) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Gọi API giao bài thi
      const response = await fetch(`${import.meta.env.VITE_TEACHER_API_URL || "http://localhost:3001/api/teacher"}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Giao bài thi thất bại");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Giao bài thi thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Set default times
  const now = new Date();
  const defaultStart = now.toISOString().slice(0, 16);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const defaultEnd = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Giao bài thi mới</h2>
            <p className="text-sm text-slate-500">Chọn bài thi và lớp học để giao</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-slate-500">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Exam Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Bài thi <span className="text-red-500">*</span>
                </label>
                <select
                  name="examId"
                  value={formData.examId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">-- Chọn bài thi --</option>
                  {exams.map((exam) => (
                    <option key={exam.examId} value={exam.examId}>
                      {exam.title} ({exam.courseName})
                    </option>
                  ))}
                </select>
                {exams.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Chưa có bài thi nào. Tạo bài thi tại trang Bài thi.
                  </p>
                )}
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Lớp học <span className="text-red-500">*</span>
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">-- Chọn lớp học --</option>
                  {classes.map((cls) => (
                    <option key={cls.classId} value={cls.classId}>
                      {cls.className} ({cls.courseName})
                    </option>
                  ))}
                </select>
                {classes.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Chưa có lớp học nào. Tạo lớp học tại trang Khóa học.
                  </p>
                )}
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime || defaultStart}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Thời gian kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime || defaultEnd}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Max Attempts */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Số lần làm bài tối đa
                </label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={formData.maxAttempts}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Số lần sinh viên được phép làm bài thi này
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <div className="flex-1" />
                <button
                  type="submit"
                  disabled={submitting || !formData.examId || !formData.classId}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang giao...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Giao bài thi
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;
