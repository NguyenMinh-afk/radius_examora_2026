import React from "react";
import { BookOpen, TrendingUp, CheckCircle } from "lucide-react";

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
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <BookOpen size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng số bài đã nộp</p>
            <p className="text-2xl font-bold text-gray-900">{totalResults}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 rounded-xl">
            <TrendingUp size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Điểm trung bình</p>
            <p className="text-2xl font-bold text-gray-900">{averageScore}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-xl">
            <CheckCircle size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tỷ lệ đạt (≥5)</p>
            <p className="text-2xl font-bold text-gray-900">
              {passedCount}/{totalResults}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultSummaryCards;
