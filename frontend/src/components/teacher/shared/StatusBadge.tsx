import React from "react";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  label?: string;
  isDark?: boolean;
}

const variantClassesLight: Record<BadgeVariant, string> = {
  success: "text-green-700 bg-green-100",
  warning: "text-amber-700 bg-amber-100",
  danger: "text-red-700 bg-red-100",
  info: "text-blue-700 bg-blue-100",
  neutral: "text-slate-600 bg-slate-100",
  purple: "text-purple-700 bg-purple-100",
};

const variantClassesDark: Record<BadgeVariant, string> = {
  success: "text-emerald-400 bg-emerald-500/20",
  warning: "text-amber-400 bg-amber-500/20",
  danger: "text-red-400 bg-red-500/20",
  info: "text-blue-400 bg-blue-500/20",
  neutral: "text-gray-400 bg-white/5",
  purple: "text-purple-400 bg-purple-500/20",
};

const defaultLabels: Record<string, { variant: BadgeVariant; label: string }> = {
  open: { variant: "success", label: "Đang mở" },
  upcoming: { variant: "info", label: "Sắp diễn ra" },
  closed: { variant: "neutral", label: "Đã đóng" },
  active: { variant: "success", label: "Hoạt động" },
  inactive: { variant: "neutral", label: "Không hoạt động" },
  graded: { variant: "success", label: "Đã chấm" },
  submitted: { variant: "warning", label: "Chưa chấm" },
  published: { variant: "success", label: "Đã xuất bản" },
  draft: { variant: "neutral", label: "Bản nháp" },
  easy: { variant: "success", label: "Dễ" },
  medium: { variant: "warning", label: "Trung bình" },
  hard: { variant: "danger", label: "Khó" },
  very_hard: { variant: "purple", label: "Rất khó" },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, label, isDark }) => {
  const config = defaultLabels[status] || { variant: variant || "neutral", label: label || status };
  const classes = isDark ? variantClassesDark[config.variant] : variantClassesLight[config.variant];

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${classes}`}>
      {label || config.label}
    </span>
  );
};

export default StatusBadge;
