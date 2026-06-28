import React from "react";
import { BookOpen } from "lucide-react";
import type { Result } from "../../../api/studentApi";
import ResultCard from "./ResultCard";

interface ResultTableProps {
  results: Result[];
  isLoading?: boolean;
}

const ResultTable: React.FC<ResultTableProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Không có kết quả nào</p>
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
