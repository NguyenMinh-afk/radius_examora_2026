import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GraduationCap, BookOpen, Bell, Pin } from "lucide-react";
import { getClassDetail, getClassPosts, type ClassDetailData, type ClassPost } from "../../../api/studentApi";
import { SectionCard, LoadingState, ErrorState } from "../../../components/student/shared";
import { ClassStatsCard } from "../../../components/student/classes";
import { AssignmentList } from "../../../components/student/assignments";

const StudentClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [data, setData] = useState<ClassDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"assignments" | "posts">("assignments");

  // Posts state
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

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "assignments"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <BookOpen size={18} />
          Bài thi
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "posts"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Bell size={18} />
          Thông báo
        </button>
      </div>

      {activeTab === "assignments" && (
        <>
          <ClassStatsCard stats={data.stats || { totalAssignments: 0, completedAssignments: 0, openAssignments: 0, upcomingAssignments: 0, averageScore: 0 }} />

          <div className="mt-8">
            <SectionCard
              title="Danh sách bài thi"
              icon={<BookOpen size={20} className="text-blue-600" />}
            >
              <AssignmentList assignments={data.assignments || []} />
            </SectionCard>
          </div>
        </>
      )}

      {activeTab === "posts" && (
        <SectionCard
          title="Thông báo từ giáo viên"
          icon={<Bell size={20} className="text-blue-600" />}
        >
          {postsLoading ? (
            <LoadingState size="md" text="Đang tải thông báo..." />
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-gray-500">Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.postId}
                  className={`p-4 border border-slate-100 rounded-xl ${
                    post.isPinned ? "bg-amber-50 border-amber-200" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {post.isPinned && <Pin size={14} className="text-amber-500" />}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPostTypeColor(post.type)}`}>
                      {getPostTypeLabel(post.type)}
                    </span>
                  </div>
                  {post.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                  )}
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <span>{post.authorName}</span>
                    <span>·</span>
                    <span>{formatDateTime(post.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
};

export default StudentClassDetailPage;
