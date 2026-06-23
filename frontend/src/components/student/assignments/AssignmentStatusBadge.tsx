import React from "react";
import { Clock, CheckCircle } from "lucide-react";

type AssignmentStatus = "open" | "upcoming" | "submitted" | "expired";

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<AssignmentStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  open: { 
    label: "Đang mở", 
    color: "text-green-700", 
    bgColor: "bg-green-100", 
    icon: <Clock size={14} /> 
  },
  upcoming: { 
    label: "Sắp diễn ra", 
    color: "text-amber-700", 
    bgColor: "bg-amber-100", 
    icon: <Clock size={14} /> 
  },
  submitted: { 
    label: "Đã nộp", 
    color: "text-blue-700", 
    bgColor: "bg-blue-100", 
    icon: <CheckCircle size={14} /> 
  },
  expired: { 
    label: "Quá hạn", 
    color: "text-red-700", 
    bgColor: "bg-red-100", 
    icon: <Clock size={14} /> 
  },
};

const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ status, size = "sm" }) => {
  const config = statusConfig[status] || statusConfig.expired;
  const sizeClass = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClass}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default AssignmentStatusBadge;
