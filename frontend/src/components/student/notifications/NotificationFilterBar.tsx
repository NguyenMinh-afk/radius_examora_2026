import React from "react";

interface NotificationFilterBarProps {
  filter: "all" | "unread";
  onFilterChange: (filter: "all" | "unread") => void;
  total: number;
  unreadCount: number;
}

const NotificationFilterBar: React.FC<NotificationFilterBarProps> = ({
  filter,
  onFilterChange,
  total,
  unreadCount,
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onFilterChange("all")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition
          ${filter === "all"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 border border-slate-200 hover:bg-slate-50"
          }`}
      >
        Tất cả ({total})
      </button>
      <button
        onClick={() => onFilterChange("unread")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition
          ${filter === "unread"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 border border-slate-200 hover:bg-slate-50"
          }`}
      >
        Chưa đọc ({unreadCount})
      </button>
    </div>
  );
};

export default NotificationFilterBar;
