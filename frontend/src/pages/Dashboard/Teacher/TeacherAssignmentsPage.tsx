import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { ClipboardList, Plus, ArrowLeft, Clock, Users, CheckCircle, Trash2, RotateCcw, XCircle, Eye } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getAssignments, getClasses, updateAssignment, deleteAssignment } from "../../../api/teacherApi";
import { TeacherAssignmentCard } from "../../../components/teacher/assignments";
import AssignmentModal from "../../../components/teacher/assignments/AssignmentModal";
import AssignmentStatusBadge from "../../../components/teacher/assignments/AssignmentStatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";
import type { Assignment, AssignmentsResponse, ClassData } from "../../../api/teacherApi";
import { useTheme } from "../../../contexts/useTheme";

const formatDateTime = (d: string) =>
  new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

const AssignmentDetailView: React.FC<{ assignment: Assignment; onClose: (id: string) => void; onReopen: (id: string) => void; onDelete: (id: string) => void; onBack: () => void }> = ({ assignment, onClose, onReopen, onDelete, onBack }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const progressPercent = assignment.studentAssigned > 0
    ? Math.round((assignment.submitted / assignment.studentAssigned) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-2 text-sm transition ${
          isDark ? "text-gray-400 hover:text-blue-400" : "text-slate-500 hover:text-blue-600"
        }`}
      >
        <ArrowLeft size={16} />
        Quay lại danh sách bài thi
      </button>

      <div className={`rounded-xl border p-6 ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{assignment.title}</h1>
            <p className={`mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{assignment.className}</p>
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-slate-400"}`}>Đề thi: {assignment.examName}</p>
          </div>
          <AssignmentStatusBadge status={assignment.status} isDark={isDark} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className={isDark ? "text-blue-400" : "text-blue-600"} />
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Mở lúc</p>
            </div>
            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{formatDateTime(assignment.startTime)}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className={isDark ? "text-red-400" : "text-red-600"} />
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Đóng lúc</p>
            </div>
            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{formatDateTime(assignment.endTime)}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>SV được giao</p>
            </div>
            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{assignment.studentAssigned}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className={isDark ? "text-emerald-400" : "text-green-600"} />
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Đã nộp</p>
            </div>
            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{assignment.submitted}/{assignment.studentAssigned}</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg mb-6 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <h3 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Tiến độ</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`text-xs w-20 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Nộp bài</span>
              <div className={`flex-1 rounded-full h-2 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className={`text-xs w-12 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{progressPercent}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs w-20 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Đã chấm</span>
              <div className={`flex-1 rounded-full h-2 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${assignment.submitted > 0 ? Math.round((assignment.graded / assignment.submitted) * 100) : 0}%` }} />
              </div>
              <span className={`text-xs w-12 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{assignment.submitted > 0 ? Math.round((assignment.graded / assignment.submitted) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/teacher/results?assignmentId=${assignment.assignmentId}`}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg transition ${
              isDark ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Eye size={16} />
            Xem kết quả chi tiết
          </Link>
          {assignment.status === "open" && (
            <button
              onClick={() => onClose(assignment.assignmentId)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg transition ${
                isDark ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              <XCircle size={16} />
              Đóng bài thi
            </button>
          )}
          {assignment.status === "closed" && (
            <button
              onClick={() => onReopen(assignment.assignmentId)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg transition ${
                isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
            >
              <RotateCcw size={16} />
              Mở lại bài thi
            </button>
          )}
          <button
            onClick={() => onDelete(assignment.assignmentId)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg transition ${
              isDark ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            <Trash2 size={16} />
            Xóa bài thi
          </button>
        </div>
      </div>
    </div>
  );
};

const TeacherAssignmentsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { assignmentId } = useParams<{ assignmentId: string }>();
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
      await updateAssignment(id, { status: "closed" });
      fetchData();
    } catch (err) {
      console.error("Failed to close assignment:", err);
    }
  };

  const handleReopen = async (id: string) => {
    try {
      await updateAssignment(id, { status: "open" });
      fetchData();
    } catch (err) {
      console.error("Failed to reopen assignment:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài thi đã giao này?")) return;
    try {
      await deleteAssignment(id);
      fetchData();
    } catch (err) {
      console.error("Failed to delete assignment:", err);
    }
  };

  // If assignmentId is present, show detail view for that specific assignment
  if (assignmentId && data) {
    const assignment = data.items.find(item => item.assignmentId === assignmentId);
    if (assignment) {
      return (
        <div className="p-8">
          <AssignmentDetailView
            assignment={assignment}
            onClose={handleClose}
            onReopen={handleReopen}
            onDelete={handleDelete}
            onBack={() => window.history.back()}
          />
        </div>
      );
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Bài thi đã giao</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
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
                    : isDark
                      ? "bg-slate-800 text-gray-300 border border-white/10 hover:bg-slate-700"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs
                  ${activeFilter === tab.key
                    ? "bg-blue-500"
                    : isDark
                      ? "bg-slate-700 text-gray-300"
                      : "bg-slate-100"}`}>
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
                className={`w-full pl-4 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  isDark
                    ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500"
                    : "bg-white border-slate-200"
                }`}
              />
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                fetchData();
              }}
              className={`px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[180px] ${
                isDark
                  ? "bg-slate-800 border-white/10 text-white"
                  : "bg-white border-slate-200"
              }`}
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
      {loading && <LoadingState size="lg" text="Đang tải bài thi..." isDark={isDark} />}

      {/* Error */}
      {error && !loading && (
        <div className="mb-6">
          <ErrorState message={error} onRetry={fetchData} isDark={isDark} />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && displayItems.length === 0 && (
        <EmptyState
          icon={<ClipboardList size={36} className={isDark ? "text-slate-600" : "text-slate-300"} />}
          title="Không tìm thấy bài thi nào"
          description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
          isDark={isDark}
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
              isDark={isDark}
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
