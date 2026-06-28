import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { ClipboardList, Plus } from "lucide-react";
import { getAssignments, getClasses } from "../../../api/teacherApi";
import { TeacherAssignmentCard } from "../../../components/teacher/assignments";
import AssignmentModal from "../../../components/teacher/assignments/AssignmentModal";
import { LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";
import type { Assignment, AssignmentsResponse, ClassData } from "../../../api/teacherApi";

const TeacherAssignmentsPage: React.FC = () => {
  const [data, setData] = useState<AssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [displayItems, setDisplayItems] = useState<Assignment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAssignments({
        search: search || undefined,
        classId: selectedClassId || undefined,
        status: activeFilter !== "all" ? activeFilter : undefined,
      });
      setData(result);
      setDisplayItems(result.items);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await getClasses();
      setClasses(result);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data) return;
    const filtered = data.items.filter((a) => {
      const matchesStatus = activeFilter === "all" || a.status === activeFilter;
      const matchesSearch = !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.examName.toLowerCase().includes(search.toLowerCase()) ||
        a.className.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    setDisplayItems(filtered);
  }, [activeFilter, search, data]);

  const handleClose = async (id: string) => {
    if (!confirm("Bạn có chắc muốn đóng bài thi này?")) return;
    try {
      await fetch(`${import.meta.env.VITE_TEACHER_API_URL || "http://localhost:3001/api/teacher"}/assignments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ status: "closed" }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to close assignment:", err);
    }
  };

  const handleReopen = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_TEACHER_API_URL || "http://localhost:3001/api/teacher"}/assignments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ status: "open" }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to reopen assignment:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài thi đã giao này?")) return;
    try {
      await fetch(`${import.meta.env.VITE_TEACHER_API_URL || "http://localhost:3001/api/teacher"}/assignments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      fetchData();
    } catch (err) {
      console.error("Failed to delete assignment:", err);
    }
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
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Giao bài mới
        </button>
      </div>

      {/* Filters */}
      {!loading && data && (
        <div className="mb-6 space-y-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tất cả", count: data.summary.total },
              { key: "open", label: "Đang mở", count: data.summary.open },
              { key: "upcoming", label: "Sắp diễn ra", count: data.summary.upcoming },
              { key: "closed", label: "Đã đóng", count: data.summary.closed },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2
                  ${activeFilter === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs
                  ${activeFilter === tab.key ? "bg-blue-500" : "bg-slate-100"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Class Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm bài thi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData()}
                className="w-full pl-4 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                fetchData();
              }}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[180px]"
            >
              <option value="">Tất cả lớp</option>
              {classes.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
            </select>
            <button
              onClick={fetchData}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              Lọc
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingState size="lg" text="Đang tải bài thi..." />}

      {/* Error */}
      {error && !loading && (
        <div className="mb-6">
          <ErrorState message={error} onRetry={fetchData} />
        </div>
      )}

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
            <TeacherAssignmentCard
              key={a.assignmentId}
              assignment={a}
              onClose={handleClose}
              onReopen={handleReopen}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AssignmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default TeacherAssignmentsPage;
