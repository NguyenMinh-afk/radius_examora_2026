import React from "react";

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  isDark?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  headerAction,
  children,
  className = "",
  noPadding = false,
  isDark,
}) => {
  return (
    <div className={`rounded-xl shadow-sm border ${className} ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      {(title || headerAction) && (
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? "border-white/10" : "border-slate-100"
        }`}>
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            {icon && <span className={isDark ? "text-blue-400" : "text-blue-600"}>{icon}</span>}
            {title}
          </h2>
          {headerAction}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>
        {children}
      </div>
    </div>
  );
};

export default SectionCard;