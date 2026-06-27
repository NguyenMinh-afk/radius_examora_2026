import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Plus, GraduationCap } from "lucide-react";
import { getClasses } from "../../../api/teacherApi";
import type { ClassData } from "../../../api/teacherApi";
import { TeacherClassCard } from "../../../components/teacher/classes";
import ClassModal from "../../../components/teacher/classes/ClassModal";
import { SearchInput, LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";

const TeacherClassesPage: React.FC = () => {
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lớp học</h1>
          <p className="text-sm text-slate-500 mt-1">
            {classes.length > 0
              ? `${classes.length} lớp · ${classes.reduce((a, c) => a + c.studentCount, 0)} sinh viên`
              : "Quản lý các lớp học của bạn"}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Tạo lớp mới
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm lớp học..."
        />
      </div>

      {/* Summary */}
      {!loading && !error && classes.length > 0 && (
        <div className="flex gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl px-4 py-2 text-sm">
            <span className="font-bold text-blue-700">{classes.length}</span> lớp
          </div>
          <div className="bg-green-50 rounded-xl px-4 py-2 text-sm">
            <span className="font-bold text-green-700">
              {classes.reduce((a, c) => a + c.studentCount, 0)}
            </span> sinh viên
          </div>
          <div className="bg-amber-50 rounded-xl px-4 py-2 text-sm">
            <span className="font-bold text-amber-700">
              {classes.reduce((a, c) => a + c.openAssignments, 0)}
            </span> bài đang mở
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingState size="lg" text="Đang tải lớp học..." />}

      {/* Error */}
      {error && !loading && <ErrorState message={error} onRetry={fetchClasses} />}

      {/* Empty */}
      {!loading && !error && displayClasses.length === 0 && (
        <EmptyState
          icon={<GraduationCap size={36} className="text-slate-300" />}
          title="Không tìm thấy lớp học nào"
          description={search ? "Thử thay đổi từ khóa tìm kiếm." : "Bạn chưa có lớp học nào."}
        />
      )}

      {/* Grid */}
      {!loading && !error && displayClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayClasses.map((cls) => (
            <TeacherClassCard
              key={cls.classId}
              classData={cls}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      {/* Modal */}
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
