import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Plus,
  Edit,
  GraduationCap,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  getCourseDetail,
  createClass,
  deleteClass,
  type CourseDetail,
} from "../../../api/teacherApi";
import { LoadingState, ErrorState, SectionCard } from "../../../components/teacher/shared";

const TeacherCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCourse = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getCourseDetail(parseInt(courseId));
      setCourse(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !newClassCode.trim() || !courseId) return;
    try {
      setCreating(true);
      await createClass({
        name: newClassName,
        classCode: newClassCode,
        courseId: parseInt(courseId),
      });
      setNewClassName("");
      setNewClassCode("");
      setShowAddClass(false);
      fetchCourse();
    } catch (err) {
      console.error("Failed to create class:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm("Bạn có chắc muốn xóa lớp học này?")) return;
    try {
      setDeletingId(classId);
      await deleteClass(classId.toString());
      fetchCourse();
    } catch (err) {
      console.error("Failed to delete class:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="p-8">
      <LoadingState size="lg" text="Đang tải thông tin khóa học..." />
    </div>
  );

  if (error || !course) return (
    <div className="p-8">
      <ErrorState message={error || "Không thể tải dữ liệu"} onRetry={fetchCourse} />
    </div>
  );

  return (
    <div className="p-8">
      {/* Back */}
      <Link to="/teacher/courses" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={16} />
        Quay lại danh sách khóa học
      </Link>

      {/* Header */}
      <SectionCard className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen size={28} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-slate-900">{course.name}</h1>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                  {course.code}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-3">
                {course.description || "Chưa có mô tả"}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <GraduationCap size={14} />
                  {course.credits} tín chỉ
                </span>
                <span>·</span>
                <span>{course.facultyName}</span>
                {course.semesterType && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {course.semesterType}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-4 py-2 transition">
            <Edit size={16} />
            Chỉnh sửa
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Users size={22} className="text-blue-600" />
            <div>
              <p className="text-xs text-slate-400">Lớp học</p>
              <p className="text-lg font-bold text-slate-900">{course.classCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <FileText size={22} className="text-indigo-600" />
            <div>
              <p className="text-xs text-slate-400">Bài thi</p>
              <p className="text-lg font-bold text-slate-900">{course.examCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <HelpCircle size={22} className="text-purple-600" />
            <div>
              <p className="text-xs text-slate-400">Câu hỏi</p>
              <p className="text-lg font-bold text-slate-900">{course.questionCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Users size={22} className="text-green-600" />
            <div>
              <p className="text-xs text-slate-400">Tổng SV</p>
              <p className="text-lg font-bold text-slate-900">
                {course.classes.reduce((sum, c) => sum + c.studentCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Classes Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Danh sách lớp học</h2>
          <button
            onClick={() => setShowAddClass(true)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 transition"
          >
            <Plus size={16} />
            Thêm lớp học
          </button>
        </div>

        {/* Add Class Form */}
        {showAddClass && (
          <SectionCard className="mb-4 border-blue-200 bg-blue-50">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên lớp</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="VD: Lớp A"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-40">
                <label className="block text-xs font-medium text-slate-600 mb-1">Mã lớp</label>
                <input
                  type="text"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                  placeholder="VD: CS101-A"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateClass}
                  disabled={!newClassName.trim() || !newClassCode.trim() || creating}
                  className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {creating ? "Đang tạo..." : "Tạo"}
                </button>
                <button
                  onClick={() => {
                    setShowAddClass(false);
                    setNewClassName("");
                    setNewClassCode("");
                  }}
                  className="px-4 py-2.5 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Classes List */}
        <SectionCard>
          {course.classes.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Chưa có lớp học nào</p>
              <p className="text-sm text-slate-400">Tạo lớp học đầu tiên cho khóa học</p>
            </div>
          ) : (
            <div className="space-y-3">
              {course.classes.map((cls) => (
                <div
                  key={cls.classId}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BookOpen size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cls.name}</h4>
                      <p className="text-xs text-slate-400">Mã lớp: {cls.classId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-900">{cls.studentCount}</p>
                      <p className="text-xs text-slate-400">Sinh viên</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/teacher/classes/${cls.classId}`}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        onClick={() => handleDeleteClass(cls.classId)}
                        disabled={deletingId === cls.classId}
                        className="p-1.5 text-xs text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to={`/teacher/exams?courseId=${courseId}`}
          className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <FileText size={24} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Quản lý bài thi</h4>
            <p className="text-xs text-slate-500">{course.examCount} bài thi</p>
          </div>
        </Link>
        <Link
          to={`/teacher/questions?courseId=${courseId}`}
          className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <HelpCircle size={24} className="text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Quản lý câu hỏi</h4>
            <p className="text-xs text-slate-500">{course.questionCount} câu hỏi</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TeacherCourseDetailPage;
