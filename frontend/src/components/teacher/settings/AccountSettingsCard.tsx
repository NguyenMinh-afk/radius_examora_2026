import React, { useState, useEffect } from "react";
import { User, Save } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { getTeacherProfile, updateTeacherProfile } from "../../../api/teacherApi";
import { updateCurrentUser } from "../../../utils/auth";

const AccountSettingsCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    teacherCode: "",
    department: "",
    specialization: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTeacherProfile();
      setFormData({
        fullName: data.fullName || "",
        phone: data.phone || "",
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "",
        teacherCode: data.teacherCode || "",
        department: data.department || "",
        specialization: data.specialization || "",
      });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await updateTeacherProfile(formData);

      updateCurrentUser({ full_name: formData.fullName });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SettingsSection title="Thông tin tài khoản" description="Quản lý thông tin cá nhân" icon={<User size={18} />}>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title="Thông tin tài khoản" description="Quản lý thông tin cá nhân" icon={<User size={18} />}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400">
            Lưu thông tin thành công!
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập họ và tên"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã giáo viên</label>
          <input
            type="text"
            name="teacherCode"
            value={formData.teacherCode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập mã giáo viên"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày sinh</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giới tính</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Khoa</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập khoa"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chuyên môn</label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập chuyên môn"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </SettingsSection>
  );
};

export default AccountSettingsCard;
