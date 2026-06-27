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
}

const AssignmentFilters: React.FC<AssignmentFiltersProps> = ({
  activeTab,
  onTabChange,
  summary,
  search,
  onSearchChange,
  onSearch,
}) => {
  const tabs = [
    { key: "all", label: "Tất cả", count: summary.total },
    { key: "open", label: "Đang mở", count: summary.open },
    { key: "upcoming", label: "Sắp diễn ra", count: summary.upcoming },
    { key: "closed", label: "Đã đóng", count: summary.closed },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2
              ${activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs
              ${activeTab === tab.key ? "bg-blue-500" : "bg-slate-100"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm bài thi..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>
  );
};

export default AssignmentFilters;
