import React from "react";
import { GraduationCap, Users, FileText, Calendar } from "lucide-react";

interface TeacherStatsCardProps {
  stats: {
    classCount: number;
    studentCount: number;
    examCount: number;
    assignmentCount: number;
  };
}

const TeacherStatsCard: React.FC<TeacherStatsCardProps> = ({ stats }) => {
  const items = [
    { label: "Lớp học", value: stats.classCount, icon: <GraduationCap size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Sinh viên", value: stats.studentCount, icon: <Users size={20} />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Đề thi", value: stats.examCount, icon: <FileText size={20} />, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Bài đã giao", value: stats.assignmentCount, icon: <Calendar size={20} />, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-base font-bold text-slate-900 mb-4">Thống kê</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label} className={`text-center p-4 rounded-xl ${item.bg}`}>
            <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-3`}>
              <span className={item.color}>{item.icon}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            <p className="text-sm text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherStatsCard;
