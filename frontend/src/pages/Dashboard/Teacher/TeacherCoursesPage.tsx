import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { BookOpen, Plus } from "lucide-react";
import { getCourses } from "../../../api/teacherApi";
import type { Course } from "../../../api/teacherApi";
import { CourseCard, CourseFilters } from "../../../components/teacher/courses";
import CourseModal from "../../../components/teacher/courses/CourseModal";
import { LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";
import { PageHeader, Card } from "../../../components/shared";
import { useTheme } from "../../../contexts/useTheme";

const TeacherCoursesPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [displayCourses, setDisplayCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourses();
      setCourses(data);
      setDisplayCourses(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );
    setDisplayCourses(filtered);
  }, [search, courses]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedCourse(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setModalMode("edit");
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (course: Course, action: "create" | "update" | "delete") => {
    if (action === "create") {
      setCourses((prev) => [...prev, course]);
    } else if (action === "update") {
      setCourses((prev) => prev.map((c) => (c.courseId === course.courseId ? course : c)));
    } else if (action === "delete") {
      setCourses((prev) => prev.filter((c) => c.courseId !== selectedCourse?.courseId));
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Khóa học"
        icon={BookOpen}
        description={courses.length > 0 ? `${courses.length} khóa học` : "Quản lý các khóa học của bạn"}
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 h-11 px-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Thêm khóa học
          </button>
        }
      />

      <Card className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={fetchCourses} isDark={isDark} />
        ) : (
          <>
            <CourseFilters search={search} onSearchChange={setSearch} isDark={isDark} />

            {loading && <LoadingState size="lg" text="Đang tải khóa học..." isDark={isDark} />}

            {!loading && displayCourses.length === 0 && (
              <EmptyState
                icon={<BookOpen size={36} className={isDark ? "text-slate-600" : "text-slate-300"} />}
                title="Không tìm thấy khóa học nào"
                description={search ? "Thử thay đổi từ khóa tìm kiếm." : "Bạn chưa có khóa học nào."}
                isDark={isDark}
              />
            )}

            {!loading && displayCourses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayCourses.map((course) => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    onEdit={handleOpenEdit}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        course={selectedCourse}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default TeacherCoursesPage;
