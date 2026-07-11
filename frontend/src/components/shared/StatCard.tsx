import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "blue" | "green" | "purple" | "amber" | "rose";
  className?: string;
  isDark?: boolean;
}

const variantStylesLight: Record<string, { bg: string; icon: string; text: string }> = {
  default: { bg: "bg-slate-100", icon: "text-slate-600", text: "text-slate-600" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", text: "text-blue-600" },
  green: { bg: "bg-emerald-50", icon: "text-emerald-600", text: "text-emerald-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", text: "text-purple-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", text: "text-amber-600" },
  rose: { bg: "bg-rose-50", icon: "text-rose-600", text: "text-rose-600" },
};

const variantStylesDark: Record<string, { bg: string; icon: string; text: string }> = {
  default: { bg: "bg-slate-700", icon: "text-slate-300", text: "text-slate-300" },
  blue: { bg: "bg-blue-500/20", icon: "text-blue-400", text: "text-blue-400" },
  green: { bg: "bg-emerald-500/20", icon: "text-emerald-400", text: "text-emerald-400" },
  purple: { bg: "bg-purple-500/20", icon: "text-purple-400", text: "text-purple-400" },
  amber: { bg: "bg-amber-500/20", icon: "text-amber-400", text: "text-amber-400" },
  rose: { bg: "bg-rose-500/20", icon: "text-rose-400", text: "text-rose-400" },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  variant = "blue",
  className = "",
  isDark = false,
}) => {
  const styles = isDark ? variantStylesDark[variant] : variantStylesLight[variant];

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-slate-500"}`}>{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>{value}</p>
            {trend && (
              <span className={`text-xs font-medium ${trend.isPositive ? (isDark ? "text-emerald-400" : "text-emerald-600") : (isDark ? "text-rose-400" : "text-rose-600")}`}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className={`rounded-lg ${styles.bg} p-2.5`}>
          <Icon size={20} className={styles.icon} />
        </div>
      </div>
    </div>
  );
};

interface StatGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const StatGrid: React.FC<StatGridProps> = ({
  children,
  columns = 4,
  className = "",
}) => {
  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-5 ${className}`}>
      {children}
    </div>
  );
};

export default StatCard;
