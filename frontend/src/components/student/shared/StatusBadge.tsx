import React from "react";

interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info" | "default";
  label: string;
  icon?: React.ReactNode;
  size?: "sm" | "md";
  isDark?: boolean;
}

const statusStylesLight: Record<string, { bg: string; text: string }> = {
  success: { bg: "bg-green-100", text: "text-green-700" },
  warning: { bg: "bg-amber-100", text: "text-amber-700" },
  error: { bg: "bg-red-100", text: "text-red-700" },
  info: { bg: "bg-blue-100", text: "text-blue-700" },
  default: { bg: "bg-gray-100", text: "text-gray-700" },
};

const statusStylesDark: Record<string, { bg: string; text: string }> = {
  success: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  warning: { bg: "bg-amber-500/20", text: "text-amber-400" },
  error: { bg: "bg-red-500/20", text: "text-red-400" },
  info: { bg: "bg-blue-500/20", text: "text-blue-400" },
  default: { bg: "bg-white/5", text: "text-gray-400" },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, icon, size = "sm", isDark }) => {
  const styles = isDark
    ? (statusStylesDark[status] || statusStylesDark.default)
    : (statusStylesLight[status] || statusStylesLight.default);
  const sizeClass = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${styles.bg} ${styles.text} ${sizeClass}`}>
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge;