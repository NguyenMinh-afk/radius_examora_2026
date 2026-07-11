import React from "react";
import { Search, Filter } from "lucide-react";

interface CourseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch?: () => void;
  isDark?: boolean;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  search,
  onSearchChange,
  onSearch,
  isDark,
}) => {
  return (
    <div className="flex gap-3 items-center">
      <div className="flex-1 relative">
        <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-slate-400"}`} />
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
            isDark
              ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500"
              : "bg-white border-slate-200 text-slate-700"
          }`}
        />
      </div>
      <button className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm transition ${
        isDark
          ? "border-white/10 text-gray-300 hover:bg-white/5"
          : "border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}>
        <Filter size={16} />
        Lọc
      </button>
    </div>
  );
};

export default CourseFilters;
