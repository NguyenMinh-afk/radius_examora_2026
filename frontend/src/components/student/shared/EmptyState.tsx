import React from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  isDark?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, isDark }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className={`p-4 rounded-full mb-4 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
        <Icon size={48} className={isDark ? "text-gray-500" : "text-gray-400"} />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>{title}</h3>
      {description && (
        <p className={`mb-4 max-w-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;