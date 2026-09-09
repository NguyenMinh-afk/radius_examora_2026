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
import { useTheme } from "../../../contexts/useTheme";

const TeacherCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
      <LoadingState size="lg" text="Đang tải thông tin khóa học..." isDark={isDark} />
    </div>
  );

  if (error || !course) return (
    <div className="p-8">
      <ErrorState message={error || "Không thể tải dữ liệu"} onRetry={fetchCourse} isDark={isDark} />
    </div>
  );

  return (
    <div className="p-8">
      <Link to="/teacher/courses" className={`inline-flex items-center gap-2 text-sm mb-6 transition ${
        isDark ? "text-gray-400 hover:text-blue-400" : "text-slate-500 hover:text-blue-600"
      }`}>
        <ArrowLeft size={16} />
        Quay lại danh sách khóa học
      </Link>

      <SectionCard className="mb-6" isDark={isDark}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isDark ? "bg-blue-500/20" : "bg-blue-50"
            }`}>
              <BookOpen size={28} className={isDark ? "text-blue-400" : "text-blue-600"} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{course.name}</h1>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                  isDark ? "text-gray-400 bg-white/5" : "text-slate-400 bg-slate-100"
                }`}>
                  {course.code}
                </span>
              </div>
              <p className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                {course.description || "Chưa có mô tả"}
              </p>
              <div className={`flex items-center gap-4 text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>
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
          <button className={`flex items-center gap-2 text-sm font-medium rounded-lg px-4 py-2 transition ${
            isDark
              ? "text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30"
              : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          }`}>
            <Edit size={16} />
            Chỉnh sửa
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <Users size={22} className={isDark ? "text-blue-400" : "text-blue-600"} />
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Lớp học</p>
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{course.classCount}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <FileText size={22} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Bài thi</p>
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{course.examCount}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <HelpCircle size={22} className={isDark ? "text-purple-400" : "text-purple-600"} />
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Câu hỏi</p>
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{course.questionCount}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <Users size={22} className={isDark ? "text-emerald-400" : "text-green-600"} />
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Tổng SV</p>
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {course.classes.reduce((sum, c) => sum + c.studentCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Danh sách lớp học</h2>
          <button
            onClick={() => setShowAddClass(true)}
            className={`flex items-center gap-2 text-sm font-medium rounded-lg px-4 py-2 transition ${
              isDark
                ? "text-blue-300 bg-blue-500/20 hover:bg-blue-500/30"
                : "text-blue-600 bg-blue-50 hover:bg-blue-100"
            }`}
          >
            <Plus size={16} />
            Thêm lớp học
          </button>
        </div>

        {showAddClass && (
          <SectionCard className={`mb-4 ${isDark ? "border-blue-500/30 bg-blue-500/10" : "border-blue-200 bg-blue-50"}`} isDark={isDark}>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className={`block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-600"}`}>Tên lớp</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="VD: Lớp A"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500" : "bg-white border-slate-200"
                  }`}
                />
              </div>
              <div className="w-40">
                <label className={`block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-600"}`}>Mã lớp</label>
                <input
                  type="text"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                  placeholder="VD: CS101-A"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500" : "bg-white border-slate-200"
                  }`}
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
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    isDark ? "text-gray-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Hủy
                </button>
              </div>
            </div>
          </SectionCard>
        )}

        <SectionCard isDark={isDark}>
          {course.classes.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap size={48} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
              <p className={isDark ? "text-gray-400" : "text-slate-500"}>Chưa có lớp học nào</p>
              <p className={`text-sm ${isDark ? "text-gray-500" : "text-slate-400"}`}>Tạo lớp học đầu tiên cho khóa học</p>
            </div>
          ) : (
            <div className="space-y-3">
              {course.classes.map((cls) => (
                <div
                  key={cls.classId}
                  className={`flex items-center justify-between p-4 rounded-xl transition ${
                    isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDark ? "bg-blue-500/20" : "bg-blue-50"
                    }`}>
                      <BookOpen size={20} className={isDark ? "text-blue-400" : "text-blue-600"} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{cls.name}</h4>
                      <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Mã lớp: {cls.classId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{cls.studentCount}</p>
                      <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Sinh viên</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/teacher/classes/${cls.classId}`}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                          isDark
                            ? "text-blue-300 bg-blue-500/20 hover:bg-blue-500/30"
                            : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                        }`}
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        onClick={() => handleDeleteClass(cls.classId)}
                        disabled={deletingId === cls.classId}
                        className={`p-1.5 text-xs rounded-lg transition disabled:opacity-60 ${
                          isDark
                            ? "text-red-400 bg-red-500/20 hover:bg-red-500/30"
                            : "text-red-500 bg-red-50 hover:bg-red-100"
                        }`}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to={`/teacher/exams?courseId=${courseId}`}
          className={`flex items-center gap-4 p-4 rounded-xl transition ${
            isDark ? "bg-indigo-500/10 hover:bg-indigo-500/20" : "bg-indigo-50 hover:bg-indigo-100"
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? "bg-indigo-500/20" : "bg-indigo-100"
          }`}>
            <FileText size={24} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
          </div>
          <div>
            <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Quản lý bài thi</h4>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>{course.examCount} bài thi</p>
          </div>
        </Link>
        <Link
          to={`/teacher/questions?courseId=${courseId}`}
          className={`flex items-center gap-4 p-4 rounded-xl transition ${
            isDark ? "bg-purple-500/10 hover:bg-purple-500/20" : "bg-purple-50 hover:bg-purple-100"
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? "bg-purple-500/20" : "bg-purple-100"
          }`}>
            <HelpCircle size={24} className={isDark ? "text-purple-400" : "text-purple-600"} />
          </div>
          <div>
            <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Quản lý câu hỏi</h4>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>{course.questionCount} câu hỏi</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TeacherCourseDetailPage;
