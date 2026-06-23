import React from "react";
import { FileText } from "lucide-react";
import type { Assignment } from "../../../api/studentApi";
import AssignmentCard from "./AssignmentCard";

interface AssignmentListProps {
  assignments: Assignment[];
  isLoading?: boolean;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ assignments, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Không có bài thi nào</p>
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
