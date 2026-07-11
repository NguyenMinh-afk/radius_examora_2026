import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Plus, GraduationCap } from "lucide-react";
import { getClasses } from "../../../api/teacherApi";
import type { ClassData } from "../../../api/teacherApi";
import { TeacherClassCard } from "../../../components/teacher/classes";
import ClassModal from "../../../components/teacher/classes/ClassModal";
import { LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";
import { PageHeader, Card, FilterBar } from "../../../components/shared";
import { useTheme } from "../../../contexts/useTheme";

const TeacherClassesPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [displayClasses, setDisplayClasses] = useState<ClassData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedClass, setSelectedClass] = useState<ClassData | undefined>();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClasses();
      setClasses(data);
      setDisplayClasses(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const filtered = classes.filter(
      (c) =>
        c.className.toLowerCase().includes(search.toLowerCase()) ||
        c.classCode.toLowerCase().includes(search.toLowerCase()) ||
        c.courseName.toLowerCase().includes(search.toLowerCase())
    );
    setDisplayClasses(filtered);
  }, [search, classes]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedClass(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (classData: ClassData) => {
    setModalMode("edit");
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (classData: ClassData, action: "create" | "update" | "delete") => {
    if (action === "create") {
      setClasses((prev) => [...prev, classData]);
    } else if (action === "update") {
      setClasses((prev) => prev.map((c) => (c.classId === classData.classId ? classData : c)));
    } else if (action === "delete") {
      setClasses((prev) => prev.filter((c) => c.classId !== selectedClass?.classId));
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Lớp học"
        icon={GraduationCap}
        description={classes.length > 0
          ? `${classes.length} lớp · ${classes.reduce((a, c) => a + c.studentCount, 0)} sinh viên`
          : "Quản lý các lớp học của bạn"
        }
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 h-11 px-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Tạo lớp mới
          </button>
        }
      />

      <Card className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={fetchClasses} isDark={isDark} />
        ) : (
          <>
            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Tìm kiếm lớp học..."
              onRefresh={fetchClasses}
              refreshing={loading}
            />

            {!loading && classes.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                <div className={`rounded-lg px-4 py-2 text-sm ${isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-50 text-slate-700"}`}>
                  <span className={`font-bold ${isDark ? "text-blue-300" : "text-blue-700"}`}>{classes.length}</span> lớp
                </div>
                <div className={`rounded-lg px-4 py-2 text-sm ${isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-slate-700"}`}>
                  <span className={`font-bold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                    {classes.reduce((a, c) => a + c.studentCount, 0)}
                  </span> sinh viên
                </div>
                <div className={`rounded-lg px-4 py-2 text-sm ${isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-50 text-slate-700"}`}>
                  <span className={`font-bold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                    {classes.reduce((a, c) => a + c.openAssignments, 0)}
                  </span> bài đang mở
                </div>
              </div>
            )}

            {loading && <LoadingState size="lg" text="Đang tải lớp học..." isDark={isDark} />}

            {!loading && displayClasses.length === 0 && (
              <EmptyState
                icon={<GraduationCap size={36} className={isDark ? "text-slate-600" : "text-slate-300"} />}
                title="Không tìm thấy lớp học nào"
                description={search ? "Thử thay đổi từ khóa tìm kiếm." : "Bạn chưa có lớp học nào."}
                isDark={isDark}
              />
            )}

            {!loading && displayClasses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayClasses.map((cls) => (
                  <TeacherClassCard
                    key={cls.classId}
                    classData={cls}
                    onEdit={handleOpenEdit}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        classData={selectedClass}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default TeacherClassesPage;
