import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { TeacherProfileCard, TeacherInfoCard, TeacherStatsCard } from "../../../components/teacher/profile";
import EditProfileModal from "../../../components/teacher/profile/EditProfileModal";
import { getTeacherProfile } from "../../../api/teacherApi";
import type { TeacherProfile } from "../../../api/teacherApi";

const TeacherProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleProfileUpdate = (updatedProfile: TeacherProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-slate-200 rounded-2xl" />
              <div className="h-32 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium mb-3">{error || "Không thể tải dữ liệu"}</p>
          <button
            onClick={fetchProfile}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
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
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ giảng viên</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin cá nhân</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <TeacherProfileCard
          teacher={profile}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <TeacherInfoCard teacher={profile} />
          <TeacherStatsCard stats={profile.stats} />
        </div>
      </div>

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSuccess={handleProfileUpdate}
      />
    </div>
  );
};

export default TeacherProfilePage;
