import React from "react";

interface AssignmentStatusBadgeProps {
  status: string;
  isDark?: boolean;
}

const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ status, isDark }) => {
  const configLight: Record<string, { label: string; className: string }> = {
    open: { label: "Đang mở", className: "text-emerald-400 bg-emerald-500/20" },
    upcoming: { label: "Sắp diễn ra", className: "text-blue-400 bg-blue-500/20" },
    closed: { label: "Đã đóng", className: "text-gray-400 bg-white/5" },
  };
  const configDark: Record<string, { label: string; className: string }> = {
    open: { label: "Đang mở", className: "text-green-700 bg-green-100" },
    upcoming: { label: "Sắp diễn ra", className: "text-blue-700 bg-blue-100" },
    closed: { label: "Đã đóng", className: "text-slate-600 bg-slate-100" },
  };

  const map = isDark ? configLight : configDark;
  const fallbackLight = { label: status, className: "text-slate-600 bg-slate-100" };
  const fallbackDark = { label: status, className: "text-gray-400 bg-white/5" };
  const fallback = isDark ? fallbackDark : fallbackLight;
  const { label, className } = map[status] || fallback;

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
};

export default AssignmentStatusBadge;
