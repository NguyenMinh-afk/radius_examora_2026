import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { FileText, Plus } from "lucide-react";
import { ExamCard, ExamFilters } from "../../../components/teacher/exams";
import ExamBuilderWizard from "../../../components/teacher/exams/ExamBuilderWizard";
import { LoadingState, ErrorState, EmptyState } from "../../../components/teacher/shared";
import { getExams, deleteExam } from "../../../api/teacherApi";
import type { Exam, ExamDetail } from "../../../api/teacherApi";

const TeacherExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPublished, setFilterPublished] = useState("");
  const [displayExams, setDisplayExams] = useState<Exam[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<"create" | "edit">("create");
  const [selectedExamDetail, setSelectedExamDetail] = useState<ExamDetail | undefined>();

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExams({ search });
      setExams(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    let filtered = exams;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(s) ||
          e.courseName?.toLowerCase().includes(s)
      );
    }
    if (filterPublished) {
      if (filterPublished === "published") filtered = filtered.filter((e) => e.published);
      else filtered = filtered.filter((e) => !e.published);
    }
    setDisplayExams(filtered);
  }, [search, filterPublished, exams]);

  const publishedCount = exams.filter((e) => e.published).length;
  const draftCount = exams.filter((e) => !e.published).length;

  const handleOpenCreate = () => {
    setWizardMode("create");
    setSelectedExamDetail(undefined);
    setIsWizardOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setWizardMode("edit");
    setSelectedExamDetail({
      examId: exam.examId,
      title: exam.title,
      description: "",
      courseId: exam.courseId,
      courseName: exam.courseName,
      questionCount: exam.questionCount,
      duration: exam.duration,
      totalPoints: exam.totalPoints,
      passingScore: exam.passingScore,
      published: exam.published,
      createdAt: exam.createdAt,
      questions: [],
    });
    setIsWizardOpen(true);
  };

  const handleDelete = async (exam: Exam) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa đề thi "${exam.title}"?`)) {
      return;
    }
    try {
      await deleteExam(exam.examId);
      setExams((prev) => prev.filter((e) => e.examId !== exam.examId));
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      alert(axiosError.response?.data?.error || (err as Error).message || "Xóa thất bại");
    }
  };

  const handleWizardSuccess = (exam: Exam) => {
    if (wizardMode === "create") {
      setExams((prev) => [exam, ...prev]);
    } else {
      setExams((prev) => prev.map((e) => (e.examId === exam.examId ? exam : e)));
    }
    setIsWizardOpen(false);
    fetchExams(); // Refresh to get updated data
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đề thi</h1>
          <p className="text-sm text-slate-500 mt-1">
            {exams.length > 0 ? `${exams.length} đề thi` : "Quản lý đề thi"}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Tạo đề thi
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ExamFilters
          search={search}
          onSearchChange={setSearch}
          filterPublished={filterPublished}
          onFilterChange={setFilterPublished}
        />
      </div>

      {/* Summary */}
      {!loading && exams.length > 0 && (
        <div className="flex gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl px-4 py-2 text-sm">
            <span className="font-bold text-blue-700">{exams.length}</span> đề thi
          </div>
          <div className="bg-green-50 rounded-xl px-4 py-2 text-sm">
            <span className="font-bold text-green-700">{publishedCount}</span> đã xuất bản
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-2 text-sm">
            <span className="font-bold text-slate-700">{draftCount}</span> bản nháp
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingState size="lg" text="Đang tải đề thi..." />}

      {/* Error */}
      {error && !loading && <ErrorState message={error} onRetry={fetchExams} />}

      {/* Empty */}
      {!loading && !error && displayExams.length === 0 && (
        <EmptyState
          icon={<FileText size={36} className="text-slate-300" />}
          title="Không tìm thấy đề thi nào"
          description={search || filterPublished ? "Thử thay đổi bộ lọc." : "Bắt đầu tạo đề thi mới."}
        />
      )}

      {/* Grid */}
      {!loading && !error && displayExams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayExams.map((exam) => (
            <ExamCard
              key={exam.examId}
              exam={exam}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ExamBuilderWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        mode={wizardMode}
        exam={selectedExamDetail}
        onSuccess={handleWizardSuccess}
      />
    </div>
  );
};

export default TeacherExamsPage;
