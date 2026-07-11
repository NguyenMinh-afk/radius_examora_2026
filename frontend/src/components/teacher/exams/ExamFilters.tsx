import React from "react";
import { Search } from "lucide-react";

interface ExamFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterPublished: string;
  onFilterChange: (value: string) => void;
  isDark?: boolean;
}

const ExamFilters: React.FC<ExamFiltersProps> = ({
  search,
  onSearchChange,
  filterPublished,
  onFilterChange,
  isDark,
}) => {
  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-slate-400"}`} />
        <input
          type="text"
          placeholder="Tìm kiếm đề thi..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
            isDark
              ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500"
              : "bg-white border-slate-200 text-slate-700"
          }`}
        />
      </div>
      <select
        value={filterPublished}
        onChange={(e) => onFilterChange(e.target.value)}
        className={`border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
          isDark
            ? "bg-slate-800 border-white/10 text-gray-200"
            : "bg-white border-slate-200 text-slate-600"
        }`}
      >
        <option value="">Tất cả</option>
        <option value="published">Đã xuất bản</option>
        <option value="draft">Bản nháp</option>
      </select>
    </div>
  );
};

export default ExamFilters;
