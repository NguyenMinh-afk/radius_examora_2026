import React, { useState, useEffect } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { getStudentClasses, type ClassData } from "../../../api/studentApi";
import { LoadingState, ErrorState } from "../../../components/student/shared";
import { ClassList } from "../../../components/student/classes";
import { JoinClassDialog } from "../../../components/student/classes/JoinClassDialog";
import { PageHeader, Card, FilterBar } from "../../../components/shared";

const StudentClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);

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
      <div>
        <LoadingState size="lg" text="Đang tải danh sách lớp..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Lớp học của tôi"
        icon={GraduationCap}
        description="Theo dõi các lớp học bạn đang tham gia, giảng viên phụ trách và các bài thi được giao."
        actions={
          <button
            onClick={() => setShowJoinDialog(true)}
            className="inline-flex items-center gap-2 h-11 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Tham gia lớp
          </button>
        }
      />

      <Card className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <>
            <div className="mb-4">
              <FilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Tìm kiếm lớp học..."
              />
            </div>
            <ClassList classes={filteredClasses} />
          </>
        )}
      </Card>

      <JoinClassDialog
        isOpen={showJoinDialog}
        onClose={() => setShowJoinDialog(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default StudentClassesPage;
