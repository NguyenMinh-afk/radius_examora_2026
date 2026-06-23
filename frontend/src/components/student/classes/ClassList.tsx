import React from "react";
import { GraduationCap } from "lucide-react";
import type { ClassData } from "../../../api/studentApi";
import ClassCard from "./ClassCard";

interface ClassListProps {
  classes: ClassData[];
  isLoading?: boolean;
}

const ClassList: React.FC<ClassListProps> = ({ classes, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Không tìm thấy lớp học nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => (
        <ClassCard key={cls.classId} classData={cls} />
      ))}
    </div>
  );
};

export default ClassList;
