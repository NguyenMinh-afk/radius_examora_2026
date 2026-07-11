import React from "react";
import { Search, RefreshCw } from "lucide-react";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filters,
  actions,
  onRefresh,
  refreshing = false,
  className = "",
}) => {
  return (
    <div className={`mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end flex-1">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Custom filters */}
        {filters && (
          <div className="flex items-center gap-3">
            {filters}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {actions}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
};

interface TabFilterProps {
  tabs: { value: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TabFilter: React.FC<TabFilterProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onTabChange(tab.value)}
          className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
            activeTab === tab.value
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
              activeTab === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
