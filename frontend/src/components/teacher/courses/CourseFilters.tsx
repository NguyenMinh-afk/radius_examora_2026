import React from "react";
import { Search, Filter } from "lucide-react";

interface CourseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch?: () => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  search,
  onSearchChange,
  onSearch,
}) => {
  return (
    <div className="flex gap-3 items-center">
      <div className="flex-1 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <button className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">
        <Filter size={16} />
        Lọc
      </button>
    </div>
  );
};

export default CourseFilters;
