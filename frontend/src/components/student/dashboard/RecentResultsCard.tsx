import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, AlertCircle } from "lucide-react";
import type { RecentResult } from "../../../api/studentApi";
import { useTheme } from "../../../contexts/useTheme";

interface RecentResultsCardProps {
  results: RecentResult[];
  maxDisplay?: number;
}

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const RecentResultsCard: React.FC<RecentResultsCardProps> = ({ results, maxDisplay = 5 }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const displayedResults = results.slice(0, maxDisplay);

  return (
    <div className={`rounded-xl shadow-sm border ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className={`p-5 border-b flex items-center justify-between ${
        isDark ? "border-white/10" : "border-slate-100"
      }`}>
        <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <BookOpen size={20} className="text-emerald-500" />
          Kết quả gần đây
        </h2>
        <Link
          to="/student/results"
          className={`text-sm flex items-center gap-1 ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
        >
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>
      <div className="p-5 space-y-4">
        {displayedResults.length > 0 ? (
          displayedResults.map((result, index) => (
            <div
              key={result.attemptId || `recent-result-${index}`}
              className={`flex items-center justify-between p-3 border rounded-lg transition ${
                isDark
                  ? "border-white/10 hover:bg-white/5"
                  : "border-slate-100 hover:bg-slate-50"
              }`}
            >
              <div>
                <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{result.title || "N/A"}</h4>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{result.className || "N/A"}</p>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Nộp: {formatDateTime(result.submittedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{result.score ?? "-"}</p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{result.percentage ?? 0}%</p>
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            <AlertCircle size={40} className="mx-auto mb-2 opacity-50" />
            <p>Chưa có kết quả nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentResultsCard;