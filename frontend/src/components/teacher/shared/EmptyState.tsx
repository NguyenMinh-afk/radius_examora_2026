import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  isDark?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = "Không có dữ liệu",
  description,
  action,
  isDark,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
        isDark ? "bg-slate-800" : "bg-slate-50"
      }`}>
        {icon || <Inbox size={36} className={isDark ? "text-slate-600" : "text-slate-300"} />}
      </div>
      <h3 className={`text-base font-semibold mb-2 ${isDark ? "text-gray-200" : "text-slate-700"}`}>{title}</h3>
      {description && (
        <p className={`text-sm text-center mb-6 max-w-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
