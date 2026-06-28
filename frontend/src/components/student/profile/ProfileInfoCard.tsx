import React from "react";
import { User, Mail, Phone, IdCard, Calendar, Heart } from "lucide-react";

interface ProfileInfoCardProps {
  fullName: string;
  email: string;
  phone?: string | null;
  studentCode?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  className?: string;
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "Chưa cập nhật";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatGender = (gender: string | null | undefined) => {
  if (!gender) return "Chưa cập nhật";
  return gender === "male" ? "Nam" : gender === "female" ? "Nữ" : "Khác";
};

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  fullName, email, phone, studentCode, dateOfBirth, gender, className = ""
}) => {
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
        {studentCode && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <IdCard size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Mã sinh viên</p>
              <p className="text-sm font-medium text-gray-900">{studentCode}</p>
            </div>
          </div>
        )}
        {dateOfBirth && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ngày sinh</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(dateOfBirth)}</p>
            </div>
          </div>
        )}
        {gender && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Heart size={18} className="text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Giới tính</p>
              <p className="text-sm font-medium text-gray-900">{formatGender(gender)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfoCard;
