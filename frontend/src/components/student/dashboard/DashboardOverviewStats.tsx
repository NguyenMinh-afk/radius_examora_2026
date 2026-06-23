import React from "react";
import { GraduationCap, FileText, Clock, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardOverview } from "../../../api/studentApi";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, bgColor = "bg-blue-50" }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon size={24} className="text-blue-600" />
      </div>
    </div>
  </div>
);

interface DashboardOverviewStatsProps {
  overview: DashboardOverview;
}

const DashboardOverviewStats: React.FC<DashboardOverviewStatsProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Lớp học của tôi"
        value={overview.classCount}
        icon={GraduationCap}
        description="Đang tham gia"
        bgColor="bg-blue-50"
      />
      <StatCard
        title="Bài thi sắp tới"
        value={overview.upcomingAssignments}
        icon={Clock}
        description="Trong tuần này"
        bgColor="bg-amber-50"
      />
      <StatCard
        title="Bài thi đang mở"
        value={overview.openAssignments}
        icon={FileText}
        description="Có thể làm ngay"
        bgColor="bg-green-50"
      />
      <StatCard
        title="Điểm trung bình"
        value={overview.averageScore || "N/A"}
        icon={TrendingUp}
        description="Kết quả học tập"
        bgColor="bg-purple-50"
      />
    </div>
  );
};

export default DashboardOverviewStats;
