import React from "react";
import { GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import { useTheme } from "../../../contexts/useTheme";

interface ProfileStatsCardProps {
  classCount?: number;
  completedExams?: number;
  averageScore?: number;
  className?: string;
}

const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({
  classCount = 0,
  completedExams = 0,
  averageScore = 0,
  className = ""
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stats = [
    {
      icon: GraduationCap,
      label: "Lớp học",
      value: classCount,
      color: isDark ? "text-blue-400" : "text-blue-600",
      bgColor: isDark ? "bg-blue-500/20" : "bg-blue-50",
    },
    {
      icon: BookOpen,
      label: "Bài thi đã làm",
      value: completedExams,
      color: isDark ? "text-emerald-400" : "text-green-600",
      bgColor: isDark ? "bg-emerald-500/20" : "bg-green-50",
    },
    {
      icon: TrendingUp,
      label: "Điểm TB",
      value: averageScore,
      color: isDark ? "text-purple-400" : "text-purple-600",
      bgColor: isDark ? "bg-purple-500/20" : "bg-purple-50",
    },
  ];

  return (
    <div className={`rounded-xl shadow-sm border p-5 ${className} ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Thống kê học tập</h3>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stat.value}</p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStatsCard;