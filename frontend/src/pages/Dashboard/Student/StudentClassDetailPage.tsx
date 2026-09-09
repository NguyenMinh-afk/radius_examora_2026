import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GraduationCap, BookOpen, Bell, Pin } from "lucide-react";
import { getClassDetail, getClassPosts, type ClassDetailData, type ClassPost } from "../../../api/studentApi";
import { LoadingState, ErrorState } from "../../../components/student/shared";
import { ClassStatsCard } from "../../../components/student/classes";
import { AssignmentList } from "../../../components/student/assignments";
import { PageHeader, Card } from "../../../components/shared";
import { useTheme } from "../../../contexts/useTheme";

const StudentClassDetailPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { classId } = useParams<{ classId: string }>();
  const [data, setData] = useState<ClassDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"assignments" | "posts">("assignments");

  const [posts, setPosts] = useState<ClassPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

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

  const fetchPosts = async () => {
    if (!classId) return;
    try {
      setPostsLoading(true);
      const result = await getClassPosts(classId);
      setPosts(result.items);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId]);

  useEffect(() => {
    if (activeTab === "posts") {
      fetchPosts();
    }
  }, [activeTab, classId]);

  const formatDateTime = (d: string) => new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  });

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "announcement": return "Thông báo";
      case "material": return "Tài liệu";
      case "assignment": return "Bài tập";
      case "question": return "Câu hỏi";
      default: return type;
    }
  };

  const getPostTypeColor = (type: string) => {
    if (isDark) {
      switch (type) {
        case "announcement": return "bg-blue-500/20 text-blue-400";
        case "material": return "bg-emerald-500/20 text-emerald-400";
        case "assignment": return "bg-purple-500/20 text-purple-400";
        case "question": return "bg-white/5 text-gray-400";
        default: return "bg-white/5 text-gray-400";
      }
    }
    switch (type) {
      case "announcement": return "bg-blue-100 text-blue-700";
      case "material": return "bg-green-100 text-green-700";
      case "assignment": return "bg-purple-100 text-purple-700";
      case "question": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div>
        <LoadingState size="lg" text="Đang tải thông tin lớp học..." isDark={isDark} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <ErrorState message={error || "Không tìm thấy lớp học"} onRetry={fetchData} isDark={isDark} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={data.classInfo?.className || "Chi tiết lớp học"}
        icon={GraduationCap}
        description={`Mã lớp: ${data.classInfo?.classCode} | Môn: ${data.classInfo?.courseName || "Chưa có"} | GV: ${data.classInfo?.teacherName || "N/A"}`}
        subtitle="Xem thông tin lớp học, bài thi và thông báo"
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`flex items-center gap-2 h-10 px-4 rounded-lg font-semibold text-sm transition ${
            activeTab === "assignments"
              ? "bg-blue-600 text-white"
              : isDark
              ? "bg-slate-800 border border-white/10 text-gray-300 hover:bg-white/5"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BookOpen size={18} />
          Bài thi
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 h-10 px-4 rounded-lg font-semibold text-sm transition ${
            activeTab === "posts"
              ? "bg-blue-600 text-white"
              : isDark
              ? "bg-slate-800 border border-white/10 text-gray-300 hover:bg-white/5"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Bell size={18} />
          Thông báo
        </button>
      </div>

      {activeTab === "assignments" && (
        <div className="space-y-6">
          <Card>
            <ClassStatsCard stats={data.stats || { totalAssignments: 0, completedAssignments: 0, openAssignments: 0, upcomingAssignments: 0, averageScore: 0 }} />
          </Card>
          <Card title="Danh sách bài thi" icon={<BookOpen size={18} className="text-blue-500" />}>
            <AssignmentList assignments={data.assignments || []} />
          </Card>
        </div>
      )}

      {activeTab === "posts" && (
        <Card title="Thông báo từ giáo viên" icon={<Bell size={18} className="text-blue-500" />}>
          {postsLoading ? (
            <LoadingState size="md" text="Đang tải thông báo..." isDark={isDark} />
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className={`mx-auto mb-3 ${isDark ? "text-gray-600" : "text-slate-300"}`} />
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.postId}
                  className={`p-4 border rounded-xl ${
                    post.isPinned
                      ? isDark
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-amber-50 border-amber-200"
                      : isDark
                      ? "bg-slate-800 border-white/10"
                      : "bg-white border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {post.isPinned && <Pin size={14} className="text-amber-500" />}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPostTypeColor(post.type)}`}>
                      {getPostTypeLabel(post.type)}
                    </span>
                  </div>
                  {post.title && (
                    <h4 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{post.title}</h4>
                  )}
                  <p className={`text-sm whitespace-pre-wrap ${isDark ? "text-gray-300" : "text-gray-600"}`}>{post.content}</p>
                  <div className={`flex items-center gap-2 mt-3 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    <span>{post.authorName}</span>
                    <span>·</span>
                    <span>{formatDateTime(post.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentClassDetailPage;