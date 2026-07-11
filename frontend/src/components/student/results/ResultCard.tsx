import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Clock } from "lucide-react";
import type { Result } from "../../../api/studentApi";
import ScoreBadge from "./ScoreBadge";
import { useTheme } from "../../../contexts/useTheme";

interface ResultCardProps {
  result: Result;
}

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl shadow-sm border hover:shadow-md transition-shadow p-5 ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{result.title || "N/A"}</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              result.status === "graded"
                ? isDark
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-green-100 text-green-700"
                : isDark
                ? "bg-blue-500/20 text-blue-400"
                : "bg-blue-100 text-blue-700"
            }`}>
              {result.status === "graded" ? "Đã chấm" : "Đã nộp"}
            </span>
          </div>
          <p className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {result.className || "N/A"} • Lần {result.attemptNumber || 1}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className={isDark ? "text-gray-500" : "text-gray-400"}>Điểm</p>
              <ScoreBadge score={result.score} isDark={isDark} />
            </div>
            <div>
              <p className={isDark ? "text-gray-500" : "text-gray-400"}>Tỷ lệ</p>
              <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{result.percentage ?? "-"}%</p>
            </div>
            <div>
              <p className={isDark ? "text-gray-500" : "text-gray-400"}>Đúng</p>
              <p className={`font-medium ${isDark ? "text-emerald-400" : "text-green-600"}`}>{result.correctAnswers || 0} câu</p>
            </div>
            <div>
              <p className={isDark ? "text-gray-500" : "text-gray-400"}>Sai</p>
              <p className={`font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>{result.wrongAnswers || 0} câu</p>
            </div>
            <div>
              <p className={isDark ? "text-gray-500" : "text-gray-400"}>Thời gian</p>
              <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                {result.timeTaken ? `${result.timeTaken} phút` : "-"}
              </p>
            </div>
          </div>

          <div className={`mt-3 flex items-center gap-4 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              Nộp: {formatDateTime(result.submittedAt)}
            </span>
          </div>
        </div>

        <Link
          to={`/student/results/${result.attemptId}`}
          className={`ml-4 px-4 py-2 font-medium rounded-lg transition flex items-center gap-1 ${
            isDark
              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
        >
          Chi tiết <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ResultCard;