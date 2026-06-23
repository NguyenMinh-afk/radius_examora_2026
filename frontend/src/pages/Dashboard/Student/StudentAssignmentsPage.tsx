import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { getStudentAssignments, type AssignmentsResponse } from "../../../api/studentApi";
import { StudentPageHeader } from "../../../components/student/layout";
import { LoadingState, ErrorState } from "../../../components/student/shared";
import { AssignmentFilters, AssignmentList } from "../../../components/student/assignments";

const StudentAssignmentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<AssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = searchParams.get("status") || undefined;
      const result = await getStudentAssignments({ status });
      setData(result);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      console.error("Error fetching assignments:", err);
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể tải danh sách bài thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ status: tab });
    }
  };

  const filteredItems = data?.items.filter((item) => {
    const matchesStatus = activeTab === "all" || item.status === activeTab;
    const matchesSearch =
      !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.courseName?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState size="lg" text="Đang tải danh sách bài thi..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <StudentPageHeader
        title="Bài thi của tôi"
        icon={FileText}
        description="Theo dõi tất cả bài thi được giao từ các lớp học mà bạn đang tham gia."
      />

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <>
          <AssignmentFilters
            activeTab={activeTab}
            onTabChange={handleTabChange}
            summary={data?.summary || { total: 0, open: 0, upcoming: 0, submitted: 0, expired: 0 }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div className="mt-6">
            <AssignmentList assignments={filteredItems || []} />
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAssignmentsPage;
