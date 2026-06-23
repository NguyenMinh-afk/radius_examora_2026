import React from "react";
import { User, Mail, Phone } from "lucide-react";

interface ProfileInfoCardProps {
  fullName: string;
  email: string;
  phone?: string;
  className?: string;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ fullName, email, phone, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <User size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Họ tên</p>
            <p className="text-sm font-medium text-gray-900">{fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Mail size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>
        </div>
        {phone && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Phone size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Số điện thoại</p>
              <p className="text-sm font-medium text-gray-900">{phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfoCard;
