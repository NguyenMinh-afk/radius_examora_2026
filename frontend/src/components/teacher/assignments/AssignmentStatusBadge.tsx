import React from "react";

interface AssignmentStatusBadgeProps {
  status: string;
}

const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ status }) => {
  const config: Record<string, { label: string; className: string }> = {
    open: { label: "Đang mở", className: "text-green-700 bg-green-100" },
    upcoming: { label: "Sắp diễn ra", className: "text-blue-700 bg-blue-100" },
    closed: { label: "Đã đóng", className: "text-slate-600 bg-slate-100" },
  };

  const { label, className } = config[status] || { label: status, className: "text-slate-600 bg-slate-100" };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
};

export default AssignmentStatusBadge;
