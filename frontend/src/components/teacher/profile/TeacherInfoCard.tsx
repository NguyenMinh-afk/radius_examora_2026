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

const TeacherInfoCard: React.FC<TeacherInfoCardProps> = ({ teacher }) => {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-base font-bold text-slate-900 mb-4">Thông tin cá nhân</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {infoItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 flex-shrink-0 shadow-sm">
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-slate-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bio */}
      {teacher.bio && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 flex-shrink-0 shadow-sm">
              <FileText size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Giới thiệu</p>
              <p className="text-sm font-medium text-slate-900">{teacher.bio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherInfoCard;
