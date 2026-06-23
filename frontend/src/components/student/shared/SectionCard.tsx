import React from "react";

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  headerAction,
  children,
  className = "",
  noPadding = false,
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      {(title || headerAction) && (
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {icon && <span className="text-blue-600">{icon}</span>}
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
