import React, { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { joinClass } from "../../../api/studentApi";

interface JoinClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinClassDialog: React.FC<JoinClassDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError("Vui lòng nhập mã lớp");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const result = await joinClass(classCode.trim().toUpperCase());
      setSuccess(`Bạn đã tham gia lớp "${result.member.className}" thành công!`);
      setTimeout(() => {
        onSuccess();
        onClose();
        setClassCode("");
        setSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể tham gia lớp");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClassCode("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Tham gia lớp học</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Nhập mã lớp được giáo viên cung cấp để tham gia lớp học.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã lớp
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => {
                setClassCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="Ví dụ: ABC123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !classCode.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Tham gia
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
