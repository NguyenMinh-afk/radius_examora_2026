import React from "react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  children,
  action,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

export default SectionCard;
