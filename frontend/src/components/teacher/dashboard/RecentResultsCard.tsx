import React from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";

interface RecentResult {
  attemptId: string;
  studentName: string;
  className: string;
  examName: string;
  score: number | null;
  percentage: number | null;
  submittedAt: string;
  status: string;
}

interface RecentResultsCardProps {
  results: RecentResult[];
}

const getScoreColor = (percentage: number | null) => {
  if (percentage === null) return "text-gray-500";
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-amber-600";
  return "text-red-600";
};

const RecentResultsCard: React.FC<RecentResultsCardProps> = ({ results }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Kết quả gần đây</h3>
          <p className="text-sm text-slate-500 mt-0.5">Bài làm mới nhất của sinh viên</p>
        </div>
        <Link
          to="/teacher/results"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Xem tất cả
          <ArrowRight size={16} />
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Star size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có kết quả nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.slice(0, 5).map((item) => (
            <Link
              key={item.attemptId}
              to={`/teacher/results/${item.attemptId}`}
              className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {item.studentName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700">
                  {item.studentName}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {item.examName} · {item.className}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {item.percentage !== null ? (
                  <>
                    <p className={`text-lg font-bold ${getScoreColor(item.percentage)}`}>
                      {item.score?.toFixed(1)}
                    </p>
                    <p className={`text-xs font-medium ${getScoreColor(item.percentage)}`}>
                      {item.percentage}%
                    </p>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentResultsCard;
