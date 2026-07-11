import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Download, Search, TrendingUp, Award, Clock } from "lucide-react";
import { getResults } from "../../../api/teacherApi";
import { SectionCard, LoadingState, ErrorState } from "../shared";
import type { Result } from "../../../api/teacherApi";

interface ClassResultsTabProps {
  classId: string;
}

const ClassResultsTab: React.FC<ClassResultsTabProps> = ({ classId }) => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getResults({ classId });
        setResults(data);
      } catch (err) {
        setError((err as Error).message || "Không thể tải kết quả");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [classId]);

  const filteredResults = results.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.assignmentTitle.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  const avgScore = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.score || 0), 0) / results.filter(r => r.score !== null).length).toFixed(1)
    : "—";

  const passRate = results.length > 0
    ? Math.round((results.filter(r => (r.percentage || 0) >= 50).length / results.filter(r => r.score !== null).length) * 100)
    : 0;

  if (loading) {
    return (
      <SectionCard>
        <LoadingState size="lg" text="Đang tải kết quả..." />
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <div>
              <p className="text-sm opacity-80">Tổng bài thi</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm opacity-80">Điểm TB</p>
              <p className="text-2xl font-bold">{avgScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Award size={20} />
            </div>
            <div>
              <p className="text-sm opacity-80">Tỷ lệ đạt</p>
              <p className="text-2xl font-bold">{passRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm opacity-80">Đã chấm</p>
              <p className="text-2xl font-bold">{results.filter(r => r.status === "graded").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sinh viên, bài thi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <SectionCard>
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Chưa có kết quả nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Sinh viên</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Bài thi</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">Lần</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">Điểm</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">%</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">Trạng thái</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Ngày nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredResults.map((r) => (
                  <tr key={r.attemptId} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                          {r.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{r.studentName}</p>
                          <p className="text-xs text-slate-400">{r.studentCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{r.assignmentTitle}</p>
                    </td>
                    <td className="text-center text-sm text-slate-500 px-4">
                      #{r.attemptNumber}
                    </td>
                    <td className="text-center px-4">
                      {r.score !== null ? (
                        <span className={`text-sm font-bold ${
                          (r.percentage || 0) >= 80 ? "text-green-600" :
                          (r.percentage || 0) >= 50 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {r.score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="text-center text-sm text-slate-600 px-4">
                      {r.percentage !== null ? `${r.percentage.toFixed(0)}%` : "—"}
                    </td>
                    <td className="text-center px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        r.status === "graded" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {r.status === "graded" ? "Đã chấm" : "Chưa chấm"}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400 px-4">
                      {formatDate(r.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* View All Link */}
      <div className="text-center">
        <Link
          to={`/teacher/results?classId=${classId}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Xem tất cả kết quả tại trang Kết quả
          <Download size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ClassResultsTab;
