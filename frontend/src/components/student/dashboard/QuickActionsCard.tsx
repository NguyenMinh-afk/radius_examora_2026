import React from "react";
import { Link } from "react-router-dom";
import { FileText, BookOpen, Bell, Settings } from "lucide-react";
import { useTheme } from "../../../contexts/useTheme";

interface QuickActionsCardProps {
  className?: string;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ className = "" }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const actions = [
    {
      icon: FileText,
      label: "Bài thi",
      description: "Làm bài thi mới",
      to: "/student/assignments",
      colorLight: "bg-blue-50 text-blue-600",
      colorDark: "bg-blue-500/20 text-blue-400",
    },
    {
      icon: BookOpen,
      label: "Kết quả",
      description: "Xem kết quả học tập",
      to: "/student/results",
      colorLight: "bg-green-50 text-green-600",
      colorDark: "bg-emerald-500/20 text-emerald-400",
    },
    {
      icon: Bell,
      label: "Thông báo",
      description: "Xem thông báo mới",
      to: "/student/notifications",
      colorLight: "bg-amber-50 text-amber-600",
      colorDark: "bg-amber-500/20 text-amber-400",
    },
    {
      icon: Settings,
      label: "Cài đặt",
      description: "Quản lý tài khoản",
      to: "/student/settings",
      colorLight: "bg-purple-50 text-purple-600",
      colorDark: "bg-purple-500/20 text-purple-400",
    },
  ];

  return (
    <div className={`rounded-xl shadow-sm border p-5 ${className} ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Thao tác nhanh</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`flex flex-col items-center p-4 rounded-lg border transition ${
              isDark
                ? "border-white/10 hover:border-white/20 hover:bg-white/5"
                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className={`p-3 rounded-xl mb-2 ${isDark ? action.colorDark : action.colorLight}`}>
              <action.icon size={24} />
            </div>
            <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{action.label}</span>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{action.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;