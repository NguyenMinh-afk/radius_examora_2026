import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GraduationCap, BookOpen } from "lucide-react";
import { getClassDetail, type ClassDetailData } from "../../../api/studentApi";
import { SectionCard, LoadingState, ErrorState } from "../../../components/student/shared";
import { ClassStatsCard } from "../../../components/student/classes";
import { AssignmentList } from "../../../components/student/assignments";

const StudentClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [data, setData] = useState<ClassDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!classId) {
      setError("Không tìm thấy ID lớp học");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getClassDetail(classId);
      setData(result);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      console.error("Error fetching class detail:", err);
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể tải thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState size="lg" text="Đang tải thông tin lớp học..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <ErrorState message={error || "Không tìm thấy lớp học"} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <a
        href="/student/classes"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Quay lại Lớp học của tôi
      </a>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <GraduationCap size={28} className="text-blue-600" />
          {data.classInfo?.className || "Chi tiết lớp học"}
        </h1>
        <p className="text-gray-500 mt-1">
          Mã lớp: {data.classInfo?.classCode} | Môn: {data.classInfo?.courseName || "Chưa có"} | GV: {data.classInfo?.teacherName || "N/A"}
        </p>
      </div>

      <ClassStatsCard stats={data.stats || { totalAssignments: 0, completedAssignments: 0, openAssignments: 0, upcomingAssignments: 0, averageScore: 0 }} />

      <div className="mt-8">
        <SectionCard
          title="Danh sách bài thi"
          icon={<BookOpen size={20} className="text-blue-600" />}
        >
          <AssignmentList assignments={data.assignments || []} />
        </SectionCard>
      </div>
    </div>
  );
};

export default StudentClassDetailPage;
