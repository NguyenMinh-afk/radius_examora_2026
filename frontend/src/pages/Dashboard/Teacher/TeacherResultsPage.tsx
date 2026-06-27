import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { getResults } from "../../../api/teacherApi";
import { TeacherResultTable } from "../../../components/teacher/results";
import { SearchInput, LoadingState, ErrorState } from "../../../components/teacher/shared";
import type { Result } from "../../../api/teacherApi";

const TeacherResultsPage: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [displayResults, setDisplayResults] = useState<Result[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResults();
      setResults(data);
      setDisplayResults(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = results.filter(
      (r) =>
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.className.toLowerCase().includes(search.toLowerCase()) ||
        r.examName.toLowerCase().includes(search.toLowerCase())
    );
    setDisplayResults(filtered);
  }, [search, results]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kết quả</h1>
          <p className="text-sm text-slate-500 mt-1">
            {results.length > 0 ? `${results.length} kết quả` : "Xem kết quả bài thi của sinh viên"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm theo tên, lớp, đề thi..."
        />
      </div>

      {/* Loading */}
      {loading && <LoadingState size="lg" text="Đang tải kết quả..." />}

      {/* Error */}
      {error && !loading && <ErrorState message={error} onRetry={fetchData} />}

      {/* Table */}
      {!loading && !error && (
        <TeacherResultTable results={displayResults} />
      )}
    </div>
  );
};

export default TeacherResultsPage;
