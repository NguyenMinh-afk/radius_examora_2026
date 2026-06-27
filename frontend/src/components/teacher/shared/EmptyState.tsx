import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = "Không có dữ liệu",
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
        {icon || <Inbox size={36} className="text-slate-300" />}
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
