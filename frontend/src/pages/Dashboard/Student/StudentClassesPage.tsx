import React, { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
import { getStudentClasses, type ClassData } from "../../../api/studentApi";
import { StudentPageHeader } from "../../../components/student/layout";
import { SearchInput, LoadingState, ErrorState } from "../../../components/student/shared";
import { ClassList } from "../../../components/student/classes";

const StudentClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentClasses();
      setClasses(data || []);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      console.error("Error fetching classes:", err);
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClasses = classes.filter(
    (cls) =>
      cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.classCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.courseName && cls.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState size="lg" text="Đang tải danh sách lớp..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <StudentPageHeader
        title="Lớp học của tôi"
        icon={GraduationCap}
        description="Theo dõi các lớp học bạn đang tham gia, giảng viên phụ trách và các bài thi được giao."
      />

      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm kiếm lớp học..."
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <ClassList classes={filteredClasses} />
      )}
    </div>
  );
};

export default StudentClassesPage;
