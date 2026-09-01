import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { FileText, ArrowLeft, Clock, BookOpen, Users, CheckCircle } from "lucide-react";
import { getStudentAssignments, type AssignmentsResponse, type Assignment } from "../../../api/studentApi";
import { LoadingState, ErrorState } from "../../../components/student/shared";
import { AssignmentList } from "../../../components/student/assignments";
import { PageHeader, Card, FilterBar, TabFilter } from "../../../components/shared";
import { useTheme } from "../../../contexts/useTheme";

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AssignmentDetailView: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      <Link
        to="/student/assignments"
        className={`inline-flex items-center gap-2 text-sm transition ${
          isDark ? "text-gray-400 hover:text-blue-400" : "text-slate-500 hover:text-blue-600"
        }`}
      >
        <ArrowLeft size={16} />
        Quay lại danh sách bài thi
      </Link>

      <div className={`rounded-xl border p-6 ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{assignment.title}</h1>
            <p className={`mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              {assignment.courseName} • {assignment.className}
            </p>
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-slate-400"}`}>GV: {assignment.teacherName}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            assignment.status === "open"
              ? isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-green-100 text-green-700"
              : assignment.status === "upcoming"
                ? isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
                : assignment.status === "submitted"
                  ? isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"
                  : isDark ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-700"
          }`}>
            {assignment.status === "open" ? "Đang mở" : 
             assignment.status === "upcoming" ? "Sắp tới" :
             assignment.status === "submitted" ? "Đã nộp" : "Hết hạn"}
          </span>
        </div>

        <div className={`p-4 rounded-lg mb-6 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <h3 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Hướng dẫn</h3>
          <p className={`text-sm ${isDark ? "text-gray-300" : "text-slate-600"}`}>
            {assignment.instructions || "Không có hướng dẫn"}
          </p>
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
              <BookOpen size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Thời gian</p>
            </div>
            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{assignment.duration || 60} phút</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className={isDark ? "text-amber-400" : "text-amber-600"} />
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Số lần làm</p>
            </div>
            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {assignment.attemptsUsed || 0} / {assignment.maxAttempts}
            </p>
          </div>
        </div>

        {assignment.latestAttempt && (
          <div className={`p-4 rounded-lg mb-6 border ${
            isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-green-50 border-green-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className={isDark ? "text-emerald-400" : "text-green-600"} />
              <h3 className={`font-semibold ${isDark ? "text-emerald-400" : "text-green-700"}`}>Kết quả lần nộp gần nhất</h3>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-slate-600"}`}>
              Điểm: <strong>{assignment.latestAttempt.score ?? "-"}</strong> ({assignment.latestAttempt.percentage ?? 0}%)
              <span className="mx-2">·</span>
              Nộp: {formatDateTime(assignment.latestAttempt.submittedAt)}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {assignment.status === "open" && (
            <Link
              to={`/student/assignments/${assignment.assignmentId}/take`}
              className={`px-6 py-3 font-semibold rounded-lg transition ${
                isDark
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              Vào thi ngay
            </Link>
          )}
          {assignment.status === "upcoming" && (
            <div className={`px-6 py-3 font-semibold rounded-lg ${
              isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
            }`}>
              Bài thi chưa mở
            </div>
          )}
          {assignment.status === "submitted" && assignment.latestAttempt && (
            <Link
              to={`/student/results/${assignment.latestAttempt.attemptId}`}
              className={`px-6 py-3 font-semibold rounded-lg transition ${
                isDark
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Xem kết quả chi tiết
            </Link>
          )}
          {assignment.status === "expired" && (
            <div className={`px-6 py-3 font-semibold rounded-lg ${
              isDark ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-500"
            }`}>
              Đã hết hạn
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentAssignmentsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { assignmentId } = useParams<{ assignmentId: string }>();
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

  // If assignmentId is present, show detail view for that specific assignment
  if (assignmentId && data) {
    const assignment = data.items.find(item => item.assignmentId === assignmentId);
    if (assignment) {
      return (
        <div className="p-6">
          <AssignmentDetailView assignment={assignment} />
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div>
        <LoadingState size="lg" text="Đang tải danh sách bài thi..." isDark={isDark} />
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
          <ErrorState message={error} onRetry={fetchData} isDark={isDark} />
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