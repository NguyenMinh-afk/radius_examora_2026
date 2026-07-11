import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { getStudentResults, type Result } from "../../../api/studentApi";
import { LoadingState, ErrorState } from "../../../components/student/shared";
import { ResultSummaryCards, ResultTable } from "../../../components/student/results";
import { PageHeader, Card, FilterBar } from "../../../components/shared";
import { useTheme } from "../../../contexts/useTheme";

const StudentResultsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
      <div>
        <LoadingState size="lg" text="Đang tải kết quả bài thi..." isDark={isDark} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Kết quả bài thi"
        icon={BookOpen}
        description="Xem lại kết quả các bài thi đã nộp và lịch sử làm bài của bạn."
      />

      <Card className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={fetchData} isDark={isDark} />
        ) : (
          <>
            <ResultSummaryCards
              totalResults={results.length}
              averageScore={averageScore}
              passedCount={passedCount}
            />

            <FilterBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm kiếm bài thi..."
              actions={
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "score")}
                  className={`h-11 px-4 border rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                    isDark
                      ? "bg-slate-800 border-white/10 text-white"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="score">Điểm cao nhất</option>
                </select>
              }
            />

            <ResultTable results={filteredResults} />
          </>
        )}
      </Card>
    </div>
  );
};

export default StudentResultsPage;