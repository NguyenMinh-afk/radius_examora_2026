import React from "react";
import { BookOpen, TrendingUp, Users } from "lucide-react";
import type { ClassStats } from "../../../api/studentApi";

interface ClassStatsCardProps {
  stats: ClassStats;
  className?: string;
}

const ClassStatsCard: React.FC<ClassStatsCardProps> = ({ stats, className = "" }) => {
  const statItems = [
    { icon: BookOpen, label: "Tổng bài thi", value: stats.totalAssignments, color: "text-blue-600" },
    { icon: Users, label: "Đã hoàn thành", value: stats.completedAssignments, color: "text-green-600" },
    { icon: TrendingUp, label: "Đang mở", value: stats.openAssignments, color: "text-amber-600" },
    { icon: Users, label: "Sắp diễn ra", value: stats.upcomingAssignments, color: "text-purple-600" },
    { icon: TrendingUp, label: "Điểm TB", value: stats.averageScore, color: "text-indigo-600" },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>
      {statItems.map((item, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <item.icon size={24} className={`mx-auto mb-2 ${item.color}`} />
          <p className="text-2xl font-bold text-gray-900">{item.value || 0}</p>
          <p className="text-xs text-gray-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default ClassStatsCard;
