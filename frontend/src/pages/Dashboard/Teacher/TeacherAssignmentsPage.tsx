import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { ClipboardList, Plus } from "lucide-react";
import { getAssignments } from "../../../api/teacherApi";
import { TeacherAssignmentCard, AssignmentFilters } from "../../../components/teacher/assignments";
import { LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";
import type { Assignment, AssignmentsResponse } from "../../../api/teacherApi";

const TeacherAssignmentsPage: React.FC = () => {
  const [data, setData] = useState<AssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [displayItems, setDisplayItems] = useState<Assignment[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAssignments({ search: search || undefined });
      setData(result);
      setDisplayItems(result.items);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data) return;
    const filtered = data.items.filter((a) => {
      return activeFilter === "all" || a.status === activeFilter;
    });
    setDisplayItems(filtered);
  }, [activeFilter, data]);

  const handleClose = async (id: string) => {
    // TODO: Gọi API đóng bài thi
    console.log("Close assignment:", id);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bài thi đã giao</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý bài thi đã giao cho các lớp
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition">
          <Plus size={18} />
          Giao bài mới
        </button>
      </div>

      {/* Filters */}
      {!loading && data && (
        <div className="mb-6">
          <AssignmentFilters
            activeTab={activeFilter}
            onTabChange={setActiveFilter}
            summary={data.summary}
            search={search}
            onSearchChange={setSearch}
            onSearch={fetchData}
          />
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingState size="lg" text="Đang tải bài thi..." />}

      {/* Error */}
      {error && !loading && <ErrorState message={error} onRetry={fetchData} />}

      {/* Empty */}
      {!loading && !error && displayItems.length === 0 && (
        <EmptyState
          icon={<ClipboardList size={36} className="text-slate-300" />}
          title="Không tìm thấy bài thi nào"
          description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
        />
      )}

      {/* List */}
      {!loading && !error && displayItems.length > 0 && (
        <div className="space-y-3">
          {displayItems.map((a) => (
            <TeacherAssignmentCard key={a.assignmentId} assignment={a} onClose={handleClose} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentsPage;
