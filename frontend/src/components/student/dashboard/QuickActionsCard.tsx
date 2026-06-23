import React from "react";
import { Link } from "react-router-dom";
import { FileText, BookOpen, Bell, Settings } from "lucide-react";

interface QuickActionsCardProps {
  className?: string;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ className = "" }) => {
  const actions = [
    {
      icon: FileText,
      label: "Bài thi",
      description: "Làm bài thi mới",
      to: "/student/assignments",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: BookOpen,
      label: "Kết quả",
      description: "Xem kết quả học tập",
      to: "/student/results",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Bell,
      label: "Thông báo",
      description: "Xem thông báo mới",
      to: "/student/notifications",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: Settings,
      label: "Cài đặt",
      description: "Quản lý tài khoản",
      to: "/student/settings",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex flex-col items-center p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition"
          >
            <div className={`p-3 rounded-xl mb-2 ${action.color}`}>
              <action.icon size={24} />
            </div>
            <span className="text-sm font-medium text-gray-900">{action.label}</span>
            <span className="text-xs text-gray-500">{action.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;
