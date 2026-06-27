import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { createClass, updateClass, deleteClass, getCourses } from "../../../api/teacherApi";
import type { ClassData, CreateClassPayload, UpdateClassPayload, Course } from "../../../api/teacherApi";

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  classData?: ClassData;
  onSuccess: (classData: ClassData, action: "create" | "update" | "delete") => void;
}

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  mode,
  classData,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const [formData, setFormData] = useState<CreateClassPayload>({
    name: "",
    classCode: "",
    courseId: undefined,
    yearLevel: "",
    academicYear: "",
    semester: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === "edit" && classData) {
      setFormData({
        name: classData.className || "",
        classCode: classData.classCode || "",
        courseId: classData.courseId || undefined,
        yearLevel: classData.yearLevel || "",
        academicYear: classData.academicYear || "",
        semester: classData.semester || "",
      });
    } else {
      setFormData({
        name: "",
        classCode: "",
        courseId: undefined,
        yearLevel: "",
        academicYear: "",
        semester: "",
      });
    }
    setError(null);
    setShowDelete(false);
  }, [mode, classData, isOpen]);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "courseId" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result: ClassData;
      if (mode === "create") {
        result = await createClass(formData);
        onSuccess(result, "create");
      } else {
        result = await updateClass(classData!.classId, formData as UpdateClassPayload);
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
      await deleteClass(classData!.classId);
      onSuccess(classData!, "delete");
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
              {mode === "create" ? "Tạo lớp học mới" : "Chỉnh sửa lớp học"}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === "create" ? "Điền thông tin lớp học" : `Cập nhật: ${classData?.className}`}
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

          {/* Class Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tên lớp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="VD: Lớp A1 - K54"
            />
          </div>

          {/* Class Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Mã lớp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="classCode"
              value={formData.classCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="VD: A1_K54"
            />
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Khóa học
            </label>
            <select
              name="courseId"
              value={formData.courseId || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Chọn khóa học</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          {/* Semester & Academic Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Học kỳ
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="">Chọn học kỳ</option>
                <option value="1">Học kỳ 1</option>
                <option value="2">Học kỳ 2</option>
                <option value="3">Học kỳ hè</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Năm học
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="VD: 2024-2025"
              />
            </div>
          </div>

          {/* Year Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Khóa
            </label>
            <input
              type="text"
              name="yearLevel"
              value={formData.yearLevel}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="VD: K54"
            />
          </div>

          {/* Delete confirmation */}
          {showDelete && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 mb-2">
                    Bạn chắc chắn muốn xóa lớp học này?
                  </p>
                  <p className="text-xs text-red-600 mb-3">
                    Lớp học chỉ có thể xóa khi chưa có sinh viên.
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
                  {mode === "create" ? "Tạo lớp" : "Lưu thay đổi"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;
