import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  statusColor?: string;
  isDark?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, statusColor, isDark }) => (
  <div className={`rounded-xl shadow border p-4 flex flex-col gap-2 min-w-[140px] ${
    isDark ? "bg-slate-900 border-white/10" : "bg-white"
  }`}>
    <div className="flex items-center gap-2">
      {icon && <span className={`text-xl ${statusColor || "text-blue-600"}`}>{icon}</span>}
      <span className={`text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>{title}</span>
    </div>
    <span className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</span>
    {description && <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{description}</span>}
  </div>
);

export default StatCard;
