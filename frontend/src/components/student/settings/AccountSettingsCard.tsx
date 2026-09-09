import React, { useState, useEffect } from "react";
import { User, Save } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { getProfile, updateProfile } from "../../../api/studentApi";
import { updateCurrentUser } from "../../../utils/auth";
import { useTheme } from "../../../contexts/useTheme";

const AccountSettingsCard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfile();
      setFormData({
        fullName: data.fullName || "",
        phone: data.phone || "",
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "",
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
      await updateProfile(formData);

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
          <div className={`h-10 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
          <div className={`h-10 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
        </div>
      </SettingsSection>
    );
  }

  const inputClass = `w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none border ${
    isDark
      ? "bg-slate-800 border-white/10 text-white"
      : "bg-white border-slate-200 text-gray-900"
  }`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;

  return (
    <SettingsSection title="Thông tin tài khoản" description="Quản lý thông tin cá nhân" icon={<User size={18} />}>
      <div className="space-y-4">
        {error && (
          <div className={`p-3 border rounded-lg text-sm ${
            isDark
              ? "bg-red-500/20 border-red-500/30 text-red-400"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {error}
          </div>
        )}
        {success && (
          <div className={`p-3 border rounded-lg text-sm ${
            isDark
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-green-50 border-green-200 text-green-600"
          }`}>
            Lưu thông tin thành công!
          </div>
        )}

        <div>
          <label className={labelClass}>Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={inputClass}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div>
          <label className={labelClass}>Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div>
          <label className={labelClass}>Ngày sinh</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Giới tính</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
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