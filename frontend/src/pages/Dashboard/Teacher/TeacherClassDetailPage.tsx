import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, BookOpen, FileText, Star, Bell, Send, Pin, Trash2 } from "lucide-react";
import { getClassDetail, getClassPosts, createClassPost, deleteClassPost, type ClassPost } from "../../../api/teacherApi";
import { LoadingState, ErrorState, StatusBadge, SectionCard } from "../../../components/teacher/shared";
import type { ClassDetailData, ClassAssignment, ClassStudent } from "../../../api/teacherApi";
import { ClassResultsTab } from "../../../components/teacher/classes";
import { useTheme } from "../../../contexts/useTheme";

const tabs = ["Bài thi", "Sinh viên", "Kết quả", "Thông báo"];

const TeacherClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<ClassDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Bài thi");

  const [posts, setPosts] = useState<ClassPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"announcement" | "material" | "assignment" | "question">("announcement");
  const [isPinned, setIsPinned] = useState(false);
  const [posting, setPosting] = useState(false);

  const fetchData = async () => {
    if (!classId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getClassDetail(classId);
      setData(result);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [classId]);

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
    if (activeTab === "Thông báo") {
      fetchPosts();
    }
  }, [activeTab, classId]);

  const handleCreatePost = async () => {
    if (!classId || !postContent.trim()) return;
    try {
      setPosting(true);
      await createClassPost(classId, {
        title: postTitle || undefined,
        content: postContent,
        type: postType,
        isPinned
      });
      setPostTitle("");
      setPostContent("");
      setPostType("announcement");
      setIsPinned(false);
      setShowPostForm(false);
      fetchPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    try {
      await deleteClassPost(postId);
      fetchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const formatDateTime = (d: string) => new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  });

  if (loading) return (
    <div className="p-8">
      <LoadingState size="lg" text="Đang tải thông tin lớp..." isDark={isDark} />
    </div>
  );

  if (error || !data) return (
    <div className="p-8">
      <ErrorState message={error || "Không thể tải dữ liệu"} onRetry={fetchData} isDark={isDark} />
    </div>
  );

  const { classInfo, students, assignments } = data;

  return (
    <div className="p-8">
      <Link to="/teacher/classes" className={`inline-flex items-center gap-2 text-sm mb-6 transition ${
        isDark ? "text-gray-400 hover:text-blue-400" : "text-slate-500 hover:text-blue-600"
      }`}>
        <ArrowLeft size={16} />
        Quay lại danh sách lớp
      </Link>

      <SectionCard className="mb-6" isDark={isDark}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{classInfo.className}</h1>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              {classInfo.courseName} · {classInfo.semester} {classInfo.academicYear} · {classInfo.classCode}
            </p>
          </div>
          <button className={`text-sm font-medium rounded-lg px-4 py-2 transition ${
            isDark
              ? "text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30"
              : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          }`}>
            + Giao bài
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <Users size={20} className={isDark ? "text-blue-400" : "text-blue-600"} />
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Sinh viên</p>
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{classInfo.studentCount}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <BookOpen size={20} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Bài thi</p>
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{classInfo.assignmentCount}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <FileText size={20} className={isDark ? "text-emerald-400" : "text-green-600"} />
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Đang mở</p>
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{classInfo.openAssignments}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <Star size={20} className={isDark ? "text-amber-400" : "text-amber-500"} />
            <div>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Điểm TB</p>
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{classInfo.averageScore?.toFixed(1) || "—"}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className={`flex gap-1 mb-6 p-1 rounded-xl w-fit ${
        isDark ? "bg-slate-800" : "bg-slate-100"
      }`}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab
                ? isDark
                  ? "bg-slate-900 text-blue-400 shadow-sm"
                  : "bg-white text-blue-700 shadow-sm"
                : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Bài thi" && (
        <SectionCard isDark={isDark}>
          <div className="space-y-3">
            {assignments.length === 0 && (
              <p className={`text-center py-12 ${isDark ? "text-gray-500" : "text-slate-400"}`}>Chưa có bài thi nào</p>
            )}
            {assignments.map((a: ClassAssignment) => (
              <Link
                key={a.assignmentId}
                to={`/teacher/assignments/${a.assignmentId}`}
                className={`flex items-center justify-between p-4 rounded-xl transition hover:scale-[1.01] ${
                  isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{a.title}</h4>
                    <StatusBadge status={a.status} isDark={isDark} />
                  </div>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                    {formatDateTime(a.startTime)} - {formatDateTime(a.endTime)}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{a.submittedCount}/{classInfo.studentCount}</p>
                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Đã nộp</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-bold ${isDark ? "text-emerald-400" : "text-green-600"}`}>{a.gradedCount}</p>
                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>Đã chấm</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {activeTab === "Sinh viên" && (
        <SectionCard isDark={isDark}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <th className={`text-left text-xs font-semibold px-6 py-3 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Sinh viên</th>
                  <th className={`text-center text-xs font-semibold px-4 py-3 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Đã làm</th>
                  <th className={`text-center text-xs font-semibold px-4 py-3 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Điểm TB</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-100"}`}>
                {students.map((s: ClassStudent) => (
                  <tr key={s.userId} className={`transition ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                          {s.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{s.fullName}</p>
                          <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`text-center text-sm px-4 ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                      {s.completedAssignments}/{classInfo.assignmentCount}
                    </td>
                    <td className="text-center px-4">
                      {s.averageScore ? (
                        <span className={`text-sm font-bold ${
                          s.averageScore >= 8
                            ? isDark ? "text-emerald-400" : "text-green-600"
                            : s.averageScore >= 6
                              ? isDark ? "text-amber-400" : "text-amber-600"
                              : isDark ? "text-red-400" : "text-red-600"
                        }`}>
                          {s.averageScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className={`text-sm ${isDark ? "text-gray-500" : "text-slate-400"}`}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {activeTab === "Kết quả" && (
        <ClassResultsTab classId={classId!} />
      )}

      {activeTab === "Thông báo" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Thông báo lớp học</h3>
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Send size={16} />
              Đăng thông báo
            </button>
          </div>

          {showPostForm && (
            <SectionCard className={isDark ? "border-blue-500/30 bg-blue-500/10" : "border-blue-200 bg-blue-50"} isDark={isDark}>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value as "announcement" | "material" | "assignment" | "question")}
                    className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? "bg-slate-800 border-white/10 text-white" : "bg-white border-slate-200"
                    }`}
                  >
                    <option value="announcement">Thông báo</option>
                    <option value="material">Tài liệu</option>
                    <option value="assignment">Bài tập</option>
                    <option value="question">Câu hỏi</option>
                  </select>
                  <label className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <Pin size={14} /> Ghim lên đầu
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Tiêu đề (không bắt buộc)"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500" : "bg-white border-slate-200"
                  }`}
                />
                <textarea
                  placeholder="Nội dung thông báo..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    isDark ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500" : "bg-white border-slate-200"
                  }`}
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowPostForm(false)}
                    className={`px-4 py-2 rounded-lg transition ${
                      isDark ? "text-gray-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!postContent.trim() || posting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {posting ? "Đang đăng..." : "Đăng"}
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard isDark={isDark}>
            {postsLoading ? (
              <LoadingState size="md" text="Đang tải thông báo..." isDark={isDark} />
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={48} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                <p className={isDark ? "text-gray-400" : "text-slate-500"}>Chưa có thông báo nào</p>
                <p className={`text-sm ${isDark ? "text-gray-500" : "text-slate-400"}`}>Đăng thông báo đầu tiên cho lớp học</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.postId}
                    className={`p-4 border rounded-xl ${
                      isDark
                        ? post.isPinned
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-slate-900 border-white/10"
                        : post.isPinned
                          ? "bg-amber-50 border-amber-200"
                          : "bg-white border-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {post.isPinned && <Pin size={14} className={isDark ? "text-amber-400" : "text-amber-500"} />}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          isDark
                            ? post.type === "announcement"
                              ? "bg-blue-500/20 text-blue-300"
                              : post.type === "material"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : post.type === "assignment"
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-slate-700 text-gray-300"
                            : post.type === "announcement"
                              ? "bg-blue-100 text-blue-700"
                              : post.type === "material"
                                ? "bg-green-100 text-green-700"
                                : post.type === "assignment"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}>
                          {post.type === "announcement" ? "Thông báo" :
                           post.type === "material" ? "Tài liệu" :
                           post.type === "assignment" ? "Bài tập" : "Câu hỏi"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.postId)}
                        className={`p-1 rounded transition ${
                          isDark
                            ? "text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                            : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {post.title && (
                      <h4 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{post.title}</h4>
                    )}
                    <p className={`text-sm whitespace-pre-wrap ${isDark ? "text-gray-300" : "text-slate-600"}`}>{post.content}</p>
                    <div className={`flex items-center gap-2 mt-3 text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                      <span>{post.authorName}</span>
                      <span>·</span>
                      <span>{formatDateTime(post.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default TeacherClassDetailPage;
