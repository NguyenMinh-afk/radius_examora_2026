import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, AlertCircle } from "lucide-react";
import type { RecentResult } from "../../../api/studentApi";

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
  const displayedResults = results.slice(0, maxDisplay);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen size={20} className="text-green-600" />
          Kết quả gần đây
        </h2>
        <Link
          to="/student/results"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>
      <div className="p-5 space-y-4">
        {displayedResults.length > 0 ? (
          displayedResults.map((result) => (
            <div
              key={result.attemptId}
              className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition"
            >
              <div>
                <h4 className="font-medium text-gray-900">{result.title || "N/A"}</h4>
                <p className="text-sm text-gray-500">{result.className || "N/A"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Nộp: {formatDateTime(result.submittedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{result.score ?? "-"}</p>
                <p className="text-xs text-gray-500">{result.percentage ?? 0}%</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle size={40} className="mx-auto mb-2 opacity-50" />
            <p>Chưa có kết quả nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentResultsCard;
