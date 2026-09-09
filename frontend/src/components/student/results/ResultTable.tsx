import React from "react";
import { BookOpen } from "lucide-react";
import type { Result } from "../../../api/studentApi";
import ResultCard from "./ResultCard";
import { useTheme } from "../../../contexts/useTheme";

interface ResultTableProps {
  results: Result[];
  isLoading?: boolean;
}

const ResultTable: React.FC<ResultTableProps> = ({ results, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`rounded-xl shadow-sm border p-5 animate-pulse ${
            isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
          }`}>
            <div className={`h-6 rounded w-1/3 mb-4 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
            <div className={`h-4 rounded w-2/3 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen size={48} className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>Không có kết quả nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <ResultCard key={result.attemptId || `result-${index}`} result={result} />
      ))}
    </div>
  );
};

export default ResultTable;