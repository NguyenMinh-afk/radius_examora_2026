import React from "react";
import { BookOpen, TrendingUp, Users } from "lucide-react";
import type { ClassStats } from "../../../api/studentApi";
import { useTheme } from "../../../contexts/useTheme";

interface ClassStatsCardProps {
  stats: ClassStats;
  className?: string;
}

const ClassStatsCard: React.FC<ClassStatsCardProps> = ({ stats, className = "" }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const statItems = [
    { icon: BookOpen, label: "Tổng bài thi", value: stats.totalAssignments, color: isDark ? "text-blue-400" : "text-blue-600" },
    { icon: Users, label: "Đã hoàn thành", value: stats.completedAssignments, color: isDark ? "text-emerald-400" : "text-green-600" },
    { icon: TrendingUp, label: "Đang mở", value: stats.openAssignments, color: isDark ? "text-amber-400" : "text-amber-600" },
    { icon: Users, label: "Sắp diễn ra", value: stats.upcomingAssignments, color: isDark ? "text-purple-400" : "text-purple-600" },
    { icon: TrendingUp, label: "Điểm TB", value: stats.averageScore, color: isDark ? "text-indigo-400" : "text-indigo-600" },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>
      {statItems.map((item, index) => (
        <div key={index} className={`rounded-xl shadow-sm border p-4 text-center ${
          isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
        }`}>
          <item.icon size={24} className={`mx-auto mb-2 ${item.color}`} />
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.value || 0}</p>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default ClassStatsCard;