import React from "react";

interface AssignmentFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  summary: {
    total: number;
    open: number;
    upcoming: number;
    submitted: number;
    expired: number;
  };
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

interface AssignmentFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  summary: {
    total: number;
    open: number;
    upcoming: number;
    submitted: number;
    expired: number;
  };
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const AssignmentFilters: React.FC<AssignmentFiltersProps> = ({
  activeTab,
  onTabChange,
  summary,
  searchTerm,
  onSearchChange,
}) => {
  const tabs = [
    { key: "all", label: "Tất cả", count: summary.total },
    { key: "open", label: "Đang mở", count: summary.open },
    { key: "upcoming", label: "Sắp diễn ra", count: summary.upcoming },
    { key: "submitted", label: "Đã nộp", count: summary.submitted },
    { key: "expired", label: "Quá hạn", count: summary.expired },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs
                ${activeTab === tab.key ? "bg-blue-500" : "bg-slate-100"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Tìm kiếm bài thi..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    </div>
  );
};

export default AssignmentFilters;
