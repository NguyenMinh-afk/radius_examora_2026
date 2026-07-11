import React from "react";
import type { Result } from "../../../api/teacherApi";
import TeacherResultCard from "./TeacherResultCard";
import { EmptyState } from "../shared";

interface TeacherResultTableProps {
  results: Result[];
  isLoading?: boolean;
  isDark?: boolean;
}

const TeacherResultTable: React.FC<TeacherResultTableProps> = ({ results, isLoading, isDark }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-20 rounded-xl animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
          />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        title="Chưa có kết quả nào"
        description="Kết quả bài thi sẽ hiển thị tại đây khi sinh viên nộp bài."
        isDark={isDark}
      />
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result, index) => (
        <TeacherResultCard key={result.attemptId || `result-${index}`} result={result} isDark={isDark} />
      ))}
    </div>
  );
};

export default TeacherResultTable;
