import React from "react";
import { GraduationCap, FileText, Clock, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardOverview } from "../../../api/studentApi";
import { useTheme } from "../../../contexts/useTheme";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  bgColor?: string;
  isDark?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, bgColor = "bg-blue-500/20", isDark }) => (
  <div className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
    isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
  }`}>
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{title}</p>
        <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
        {description && <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{description}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon size={24} className={isDark ? "text-blue-400" : "text-blue-600"} />
      </div>
    </div>
  </div>
);

interface DashboardOverviewStatsProps {
  overview: DashboardOverview;
}

const DashboardOverviewStats: React.FC<DashboardOverviewStatsProps> = ({ overview }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Lớp học của tôi"
        value={overview.classCount}
        icon={GraduationCap}
        description="Đang tham gia"
        bgColor={isDark ? "bg-blue-500/20" : "bg-blue-50"}
        isDark={isDark}
      />
      <StatCard
        title="Bài thi sắp tới"
        value={overview.upcomingAssignments}
        icon={Clock}
        description="Trong tuần này"
        bgColor={isDark ? "bg-amber-500/20" : "bg-amber-50"}
        isDark={isDark}
      />
      <StatCard
        title="Bài thi đang mở"
        value={overview.openAssignments}
        icon={FileText}
        description="Có thể làm ngay"
        bgColor={isDark ? "bg-emerald-500/20" : "bg-green-50"}
        isDark={isDark}
      />
      <StatCard
        title="Điểm trung bình"
        value={overview.averageScore || "N/A"}
        icon={TrendingUp}
        description="Kết quả học tập"
        bgColor={isDark ? "bg-purple-500/20" : "bg-purple-50"}
        isDark={isDark}
      />
    </div>
  );
};

export default DashboardOverviewStats;