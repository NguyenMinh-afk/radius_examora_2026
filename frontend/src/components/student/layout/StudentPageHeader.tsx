import React from "react";
import type { LucideIcon } from "lucide-react";

interface StudentPageHeaderProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

const StudentPageHeader: React.FC<StudentPageHeaderProps> = ({
  title,
  icon: Icon,
  description,
  backTo,
  backLabel,
  actions,
}) => {
  return (
    <div className="mb-8">
      {/* Back button */}
      {backTo && (
        <a
          href={backTo}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4 transition text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          {backLabel || "Quay lại"}
        </a>
      )}

      {/* Header content */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {Icon && <Icon size={28} className="text-blue-600" />}
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPageHeader;
