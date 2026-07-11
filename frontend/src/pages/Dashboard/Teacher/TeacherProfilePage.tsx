import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { TeacherProfileCard, TeacherInfoCard, TeacherStatsCard } from "../../../components/teacher/profile";
import { getTeacherProfile } from "../../../api/teacherApi";
import type { TeacherProfile } from "../../../api/teacherApi";
import { useTheme } from "../../../contexts/useTheme";

const TeacherProfilePage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTeacherProfile();
      setProfile(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      console.error("Error fetching profile:", err);
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className={`h-8 rounded w-48 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`h-64 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
            <div className="lg:col-span-2 space-y-6">
              <div className={`h-48 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
              <div className={`h-32 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8">
        <div className={`border rounded-xl p-6 text-center ${
          isDark
            ? "bg-red-500/10 border-red-500/30"
            : "bg-red-50 border-red-200"
        }`}>
          <p className={`font-medium mb-3 ${
            isDark ? "text-red-400" : "text-red-600"
          }`}>{error || "Không thể tải dữ liệu"}</p>
          <button
            onClick={fetchProfile}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              isDark
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Hồ sơ giảng viên</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Quản lý thông tin cá nhân</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <TeacherProfileCard teacher={profile} isDark={isDark} />

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <TeacherInfoCard teacher={profile} isDark={isDark} />
          <TeacherStatsCard stats={profile.stats} isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;