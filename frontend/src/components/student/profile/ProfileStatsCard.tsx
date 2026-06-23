import React from "react";
import { GraduationCap, BookOpen, TrendingUp } from "lucide-react";

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
  const stats = [
    { icon: GraduationCap, label: "Lớp học", value: classCount, color: "text-blue-600", bgColor: "bg-blue-50" },
    { icon: BookOpen, label: "Bài thi đã làm", value: completedExams, color: "text-green-600", bgColor: "bg-green-50" },
    { icon: TrendingUp, label: "Điểm TB", value: averageScore, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4">Thống kê học tập</h3>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStatsCard;
