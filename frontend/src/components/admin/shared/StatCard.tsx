import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  statusColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, statusColor }) => (
  <div className="bg-white rounded-xl shadow border p-4 flex flex-col gap-2 min-w-[140px]">
    <div className="flex items-center gap-2">
      {icon && <span className={`text-xl ${statusColor || "text-blue-600"}`}>{icon}</span>}
      <span className="text-xs font-semibold text-gray-500">{title}</span>
    </div>
    <span className="text-2xl font-bold text-gray-900">{value}</span>
    {description && <span className="text-xs text-gray-400">{description}</span>}
  </div>
);

export default StatCard;
