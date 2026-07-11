import React from "react";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "../../contexts/useTheme";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon: Icon,
  description,
  subtitle,
  actions,
  className = "",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-slate-950"}`}>
            {Icon && <Icon size={26} className={isDark ? "text-blue-400" : "text-blue-600"} />}
            {title}
          </h1>
          {description && (
            <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>{description}</p>
          )}
          {subtitle && (
            <p className={`mt-0.5 text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;