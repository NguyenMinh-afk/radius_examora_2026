import React from "react";
import { GraduationCap } from "lucide-react";
import type { ClassData } from "../../../api/studentApi";
import ClassCard from "./ClassCard";
import { useTheme } from "../../../contexts/useTheme";

interface ClassListProps {
  classes: ClassData[];
  isLoading?: boolean;
}

const ClassList: React.FC<ClassListProps> = ({ classes, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`rounded-xl shadow-sm border p-5 animate-pulse ${
            isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
          }`}>
            <div className={`h-20 rounded mb-4 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
            <div className={`h-4 rounded mb-2 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
            <div className={`h-4 rounded w-2/3 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
          </div>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap size={48} className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>Không tìm thấy lớp học nào</p>
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