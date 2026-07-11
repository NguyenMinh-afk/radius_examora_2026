import React from "react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  children,
  action,
  className = "",
  isDark,
}) => {
  return (
    <div className={`rounded-2xl border shadow-sm p-6 ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    } ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
            {subtitle && <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

export default SectionCard;
