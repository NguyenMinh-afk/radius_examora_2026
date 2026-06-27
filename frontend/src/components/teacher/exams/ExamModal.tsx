import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { createExam, updateExam, deleteExam } from "../../../api/teacherApi";
import type { Exam, CreateExamPayload, UpdateExamPayload } from "../../../api/teacherApi";

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  exam?: Exam;
  onSuccess: (exam: Exam, action: "create" | "update" | "delete") => void;
}

const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  mode,
  exam,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState<CreateExamPayload>({
    title: "",
    description: "",
  });

  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (mode === "edit" && exam) {
      setFormData({
        title: exam.title || "",
        description: exam.description || "",
      });
      setPublished(exam.published);
    } else {
      setFormData({
        title: "",
        description: "",
      });
      setPublished(false);
    }
    setError(null);
    setShowDelete(false);
  }, [mode, exam, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result: Exam;
      if (mode === "create") {
        result = await createExam(formData);
        onSuccess(result, "create");
      } else {
        result = await updateExam(exam!.examId, {
          ...formData,
          published,
        } as UpdateExamPayload);
        onSuccess(result, "update");
      }
      onClose();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setError(error.response?.data?.error || error.message || "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError(null);

    try {
      await deleteExam(exam!.examId);
      onSuccess(exam!, "delete");
      onClose();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setError(error.response?.data?.error || error.message || "Xóa thất bại");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === "create" ? "Tạo đề thi mới" : "Chỉnh sửa đề thi"}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === "create" ? "Tạo đề thi từ đầu" : `Cập nhật: ${exam?.title}`}
            </p>
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Exam Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tên đề thi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="VD: Giữa kỳ - Toán cao cấp A1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              placeholder="Mô tả nội dung đề thi, thời gian làm bài..."
            />
          </div>

          {/* Published Toggle */}
          {mode === "edit" && (
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700">Xuất bản đề thi</p>
                <p className="text-xs text-slate-500">
                  Đề thi sẽ có thể được giao cho học sinh
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          {/* Delete confirmation */}
          {showDelete && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 mb-2">
                    Bạn chắc chắn muốn xóa đề thi này?
                  </p>
                  <p className="text-xs text-red-600 mb-3">
                    Đề thi chỉ có thể xóa khi chưa được giao cho lớp nào.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDelete(false)}
                      className="px-3 py-1.5 text-sm border border-red-200 rounded-lg text-red-600 hover:bg-red-100 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1"
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Đang xóa...
                        </>
                      ) : (
                        <>
                          <Trash2 size={14} />
                          Xóa
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {mode === "edit" && !showDelete && (
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="px-4 py-2.5 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Xóa
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {mode === "create" ? "Tạo đề thi" : "Lưu thay đổi"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamModal;
