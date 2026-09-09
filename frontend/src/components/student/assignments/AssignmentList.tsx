import React from "react";
import { FileText } from "lucide-react";
import type { Assignment } from "../../../api/studentApi";
import AssignmentCard from "./AssignmentCard";
import { useTheme } from "../../../contexts/useTheme";

interface AssignmentListProps {
  assignments: Assignment[];
  isLoading?: boolean;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ assignments, isLoading }) => {
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
            <div className={`h-4 rounded w-2/3 mb-2 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
            <div className={`h-4 rounded w-1/2 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
          </div>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>Không có bài thi nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.studentAssignmentId} assignment={assignment} />
      ))}
    </div>
  );
};

export default AssignmentList;