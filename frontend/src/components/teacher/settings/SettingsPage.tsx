import React from "react";
import { User, Bell, Shield, Palette, Globe } from "lucide-react";

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bg: string;
  onClick?: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  icon, title, description, color, bg, onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left hover:border-blue-200 hover:shadow-md transition w-full"
    >
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
        <span className={color}>{icon}</span>
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </button>
  );
};

const SettingsPage: React.FC = () => {
  const sections = [
    {
      icon: <User size={20} className="text-blue-600" />,
      title: "Tài khoản",
      description: "Cập nhật thông tin đăng nhập và mật khẩu",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: <Bell size={20} className="text-indigo-600" />,
      title: "Thông báo",
      description: "Cấu hình thông báo email và push",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: <Shield size={20} className="text-green-600" />,
      title: "Bảo mật",
      description: "Bật/tắt xác thực hai yếu tố (2FA)",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: <Palette size={20} className="text-purple-600" />,
      title: "Giao diện",
      description: "Chọn giao diện sáng/tối",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: <Globe size={20} className="text-teal-600" />,
      title: "Ngôn ngữ",
      description: "Chọn ngôn ngữ hiển thị",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Cài đặt</h1>
      <p className="text-sm text-slate-500 mb-8">Quản lý cài đặt tài khoản và hệ thống</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section) => (
          <SettingsSection key={section.title} {...section} />
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
