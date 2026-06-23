import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { getStudentResults, type Result } from "../../../api/studentApi";
import { StudentPageHeader } from "../../../components/student/layout";
import { LoadingState, ErrorState, SearchInput } from "../../../components/student/shared";
import { ResultSummaryCards, ResultTable } from "../../../components/student/results";

const StudentResultsPage: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "score">("newest");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentResults();
      setResults(data || []);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      console.error("Error fetching results:", err);
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể tải kết quả bài thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredResults = results
    .filter(
      (r) =>
        (r.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (r.className?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
      }
      return (b.score ?? 0) - (a.score ?? 0);
    });

  const averageScore =
    results.length > 0
      ? (results.reduce((sum, r) => sum + (r.score ?? 0), 0) / results.length).toFixed(1)
      : "N/A";

  const passedCount = results.filter((r) => (r.score ?? 0) >= 5).length;

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState size="lg" text="Đang tải kết quả bài thi..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <StudentPageHeader
        title="Kết quả bài thi"
        icon={BookOpen}
        description="Xem lại kết quả các bài thi đã nộp và lịch sử làm bài của bạn."
      />

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <>
          <ResultSummaryCards
            totalResults={results.length}
            averageScore={averageScore}
            passedCount={passedCount}
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Tìm kiếm bài thi..."
              className="flex-1 max-w-md"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "score")}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="score">Điểm cao nhất</option>
            </select>
          </div>

          <div className="mt-6">
            <ResultTable results={filteredResults} />
          </div>
        </>
      )}
    </div>
  );
};

export default StudentResultsPage;
