import React from "react";
import { User, Mail, Phone, IdCard, Calendar, Heart } from "lucide-react";
import { useTheme } from "../../../contexts/useTheme";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl shadow-sm border p-5 ${className} ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Thông tin cá nhân</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
            <User size={18} className={isDark ? "text-blue-400" : "text-blue-600"} />
          </div>
          <div>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Họ tên</p>
            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
            <Mail size={18} className={isDark ? "text-blue-400" : "text-blue-600"} />
          </div>
          <div>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Email</p>
            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{email}</p>
          </div>
        </div>
        {phone && (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
              <Phone size={18} className={isDark ? "text-blue-400" : "text-blue-600"} />
            </div>
            <div>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Số điện thoại</p>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{phone}</p>
            </div>
          </div>
        )}
        {studentCode && (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-emerald-500/20" : "bg-green-50"}`}>
              <IdCard size={18} className={isDark ? "text-emerald-400" : "text-green-600"} />
            </div>
            <div>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mã sinh viên</p>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{studentCode}</p>
            </div>
          </div>
        )}
        {dateOfBirth && (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-purple-500/20" : "bg-purple-50"}`}>
              <Calendar size={18} className={isDark ? "text-purple-400" : "text-purple-600"} />
            </div>
            <div>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ngày sinh</p>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{formatDate(dateOfBirth)}</p>
            </div>
          </div>
        )}
        {gender && (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-pink-500/20" : "bg-pink-50"}`}>
              <Heart size={18} className={isDark ? "text-pink-400" : "text-pink-600"} />
            </div>
            <div>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Giới tính</p>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{formatGender(gender)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfoCard;