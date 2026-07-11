import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { getStudentAssignments, type AssignmentsResponse } from "../../../api/studentApi";
import { LoadingState, ErrorState } from "../../../components/student/shared";
import { AssignmentList } from "../../../components/student/assignments";
import { PageHeader, Card, FilterBar, TabFilter } from "../../../components/shared";

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
      <div>
        <LoadingState size="lg" text="Đang tải danh sách bài thi..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Bài thi của tôi"
        icon={FileText}
        description="Theo dõi tất cả bài thi được giao từ các lớp học mà bạn đang tham gia."
      />

      <Card className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <>
            <TabFilter
              tabs={[
                { value: "all", label: "Tất cả", count: data?.summary?.total },
                { value: "open", label: "Đang mở", count: data?.summary?.open },
                { value: "upcoming", label: "Sắp tới", count: data?.summary?.upcoming },
                { value: "submitted", label: "Đã nộp", count: data?.summary?.submitted },
                { value: "expired", label: "Hết hạn", count: data?.summary?.expired },
              ]}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            <FilterBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm kiếm bài thi..."
            />

            <AssignmentList assignments={filteredItems || []} />
          </>
        )}
      </Card>
    </div>
  );
};

export default StudentAssignmentsPage;
