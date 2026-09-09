import React from "react";
import { BookOpen, TrendingUp, CheckCircle } from "lucide-react";
import { useTheme } from "../../../contexts/useTheme";

interface ResultSummaryCardsProps {
  totalResults: number;
  averageScore: string | number;
  passedCount: number;
  className?: string;
}

const ResultSummaryCards: React.FC<ResultSummaryCardsProps> = ({
  totalResults,
  averageScore,
  passedCount,
  className = "",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      <div className={`rounded-xl shadow-sm border p-5 ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
            <BookOpen size={24} className={isDark ? "text-blue-400" : "text-blue-600"} />
          </div>
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tổng số bài đã nộp</p>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{totalResults}</p>
          </div>
        </div>
      </div>
      <div className={`rounded-xl shadow-sm border p-5 ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? "bg-emerald-500/20" : "bg-green-50"}`}>
            <TrendingUp size={24} className={isDark ? "text-emerald-400" : "text-green-600"} />
          </div>
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Điểm trung bình</p>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{averageScore}</p>
          </div>
        </div>
      </div>
      <div className={`rounded-xl shadow-sm border p-5 ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? "bg-purple-500/20" : "bg-purple-50"}`}>
            <CheckCircle size={24} className={isDark ? "text-purple-400" : "text-purple-600"} />
          </div>
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tỷ lệ đạt (≥5)</p>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {passedCount}/{totalResults}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultSummaryCards;