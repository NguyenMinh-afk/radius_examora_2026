import React from "react";
import { Search } from "lucide-react";

interface AssignmentFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  summary: {
    total: number;
    open: number;
    upcoming: number;
    closed: number;
  };
  search: string;
  onSearchChange: (value: string) => void;
  onSearch?: () => void;
  isDark?: boolean;
}

const AssignmentFilters: React.FC<AssignmentFiltersProps> = ({
  activeTab,
  onTabChange,
  summary,
  search,
  onSearchChange,
  onSearch,
  isDark,
}) => {
  const tabs = [
    { key: "all", label: "Tất cả", count: summary.total },
    { key: "open", label: "Đang mở", count: summary.open },
    { key: "upcoming", label: "Sắp diễn ra", count: summary.upcoming },
    { key: "closed", label: "Đã đóng", count: summary.closed },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : isDark
                  ? "bg-slate-800 text-gray-300 border border-white/10 hover:bg-slate-700"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.key
                ? "bg-blue-500"
                : isDark
                  ? "bg-white/5"
                  : "bg-slate-100"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-slate-400"}`} />
        <input
          type="text"
          placeholder="Tìm kiếm bài thi..."
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
    </div>
  );
};

export default AssignmentFilters;
