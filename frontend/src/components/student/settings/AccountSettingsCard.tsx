import React from "react";
import { User } from "lucide-react";
import SettingsSection from "./SettingsSection";

interface AccountSettingsCardProps {
  userName?: string;
  email?: string;
  onUpdateName?: (name: string) => void;
}

const AccountSettingsCard: React.FC<AccountSettingsCardProps> = ({ userName = "", email = "" }) => {
  return (
    <SettingsSection title="Thông tin tài khoản" description="Quản lý thông tin cá nhân" icon={<User size={18} />}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
          <input
            type="text"
            defaultValue={userName}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập tên hiển thị"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            defaultValue={email}
            disabled
            className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
        </div>
        <div className="pt-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Lưu thay đổi
          </button>
        </div>
      </div>
    </SettingsSection>
  );
};

export default AccountSettingsCard;
