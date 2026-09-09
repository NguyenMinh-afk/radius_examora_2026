import React from "react";
import { Clock, CheckCircle } from "lucide-react";
import { useTheme } from "../../../contexts/useTheme";

type AssignmentStatus = "open" | "upcoming" | "submitted" | "expired";

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
  size?: "sm" | "md";
  isDark?: boolean;
}

const buildStatusConfig = (isDark: boolean) => {
  const config: Record<AssignmentStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    open: {
      label: "Đang mở",
      color: isDark ? "text-emerald-400" : "text-green-700",
      bgColor: isDark ? "bg-emerald-500/20" : "bg-green-100",
      icon: <Clock size={14} />,
    },
    upcoming: {
      label: "Sắp diễn ra",
      color: isDark ? "text-amber-400" : "text-amber-700",
      bgColor: isDark ? "bg-amber-500/20" : "bg-amber-100",
      icon: <Clock size={14} />,
    },
    submitted: {
      label: "Đã nộp",
      color: isDark ? "text-blue-400" : "text-blue-700",
      bgColor: isDark ? "bg-blue-500/20" : "bg-blue-100",
      icon: <CheckCircle size={14} />,
    },
    expired: {
      label: "Quá hạn",
      color: isDark ? "text-red-400" : "text-red-700",
      bgColor: isDark ? "bg-red-500/20" : "bg-red-100",
      icon: <Clock size={14} />,
    },
  };
  return config;
};

const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ status, size = "sm", isDark: isDarkProp }) => {
  const { theme } = useTheme();
  const isDark = isDarkProp ?? theme === "dark";
  const statusConfig = buildStatusConfig(isDark);
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