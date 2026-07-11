import React from "react";
import { User, Mail, Phone, Award, Building, Briefcase, Calendar, UserCheck, School, FileText } from "lucide-react";

interface TeacherInfoCardProps {
  teacher: {
    fullName: string;
    email: string;
    phone?: string;
    teacherCode?: string | null;
    department?: string | null;
    specialization?: string | null;
    bio?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    schoolName?: string | null;
  };
  isDark?: boolean;
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatGender = (gender: string | null | undefined) => {
  if (!gender) return "—";
  if (gender === "male" || gender === "Male" || gender === "nam") return "Nam";
  if (gender === "female" || gender === "Female" || gender === "nữ") return "Nữ";
  return gender;
};

const TeacherInfoCard: React.FC<TeacherInfoCardProps> = ({ teacher, isDark }) => {
  const infoItems = [
    { label: "Họ và tên", value: teacher.fullName, icon: <User size={16} /> },
    { label: "Email", value: teacher.email, icon: <Mail size={16} /> },
    { label: "Số điện thoại", value: teacher.phone || "—", icon: <Phone size={16} /> },
    { label: "Mã giảng viên", value: teacher.teacherCode || "—", icon: <Award size={16} /> },
    { label: "Khoa", value: teacher.department || "—", icon: <Building size={16} /> },
    { label: "Chuyên môn", value: teacher.specialization || "—", icon: <Briefcase size={16} /> },
    { label: "Ngày sinh", value: formatDate(teacher.dateOfBirth), icon: <Calendar size={16} /> },
    { label: "Giới tính", value: formatGender(teacher.gender), icon: <UserCheck size={16} /> },
    { label: "Trường học", value: teacher.schoolName || "—", icon: <School size={16} /> },
  ];

  return (
    <div className={`rounded-2xl border shadow-sm p-6 ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <h3 className={`text-base font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Thông tin cá nhân</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-start gap-3 p-3 rounded-xl ${
              isDark ? "bg-slate-800" : "bg-slate-50"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
              isDark ? "bg-slate-700 text-gray-300" : "bg-white text-slate-500"
            }`}>
              {item.icon}
            </div>
            <div>
              <p className={`text-xs mb-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`}>{item.label}</p>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {teacher.bio && (
        <div className={`mt-4 p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
              isDark ? "bg-slate-700 text-gray-300" : "bg-white text-slate-500"
            }`}>
              <FileText size={16} />
            </div>
            <div>
              <p className={`text-xs mb-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`}>Giới thiệu</p>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{teacher.bio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherInfoCard;
