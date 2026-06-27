import React from "react";
import type { Result } from "../../../api/teacherApi";
import TeacherResultCard from "./TeacherResultCard";
import { EmptyState } from "../shared";

interface TeacherResultTableProps {
  results: Result[];
  isLoading?: boolean;
}

const TeacherResultTable: React.FC<TeacherResultTableProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        title="Chưa có kết quả nào"
        description="Kết quả bài thi sẽ hiển thị tại đây khi sinh viên nộp bài."
      />
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <TeacherResultCard key={result.attemptId} result={result} />
      ))}
    </div>
  );
};

export default TeacherResultTable;
