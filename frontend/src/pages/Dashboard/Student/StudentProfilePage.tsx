import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { StudentPageHeader } from "../../../components/student/layout";
import { LoadingState, ErrorState } from "../../../components/student/shared";
import { ProfileHero, ProfileInfoCard, ProfileAcademicCard, ProfileStatsCard } from "../../../components/student/profile";
import { getStudentDashboard, getStudentClasses, type DashboardData } from "../../../api/studentApi";

const StudentProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<DashboardData | null>(null);
  const [classCount, setClassCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardData, classesData] = await Promise.all([
        getStudentDashboard(),
        getStudentClasses()
      ]);
      setStudentData(dashboardData);
      setClassCount(classesData?.length || 0);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      console.error("Error fetching profile:", err);
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState size="lg" text="Đang tải thông tin hồ sơ..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <StudentPageHeader
        title="Hồ sơ cá nhân"
        icon={User}
        description="Xem và quản lý thông tin cá nhân của bạn."
      />

      <ProfileHero
        fullName={studentData?.student?.fullName || "Học sinh"}
        email={studentData?.student?.email || ""}
        avatarUrl={studentData?.student?.avatarUrl}
        studentCode={studentData?.student?.studentCode}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <ProfileInfoCard
          fullName={studentData?.student?.fullName || "Học sinh"}
          email={studentData?.student?.email || ""}
          phone={studentData?.student?.phone}
          studentCode={studentData?.student?.studentCode}
          dateOfBirth={studentData?.student?.dateOfBirth}
          gender={studentData?.student?.gender}
        />
        <ProfileAcademicCard
          studentCode={studentData?.student?.studentCode}
          yearLevel={studentData?.student?.academic?.yearLevel}
          semester={studentData?.student?.academic?.semester}
          academicYear={studentData?.student?.academic?.academicYear}
        />
      </div>

      <div className="mt-8">
        <ProfileStatsCard
          classCount={classCount}
          completedExams={0}
          averageScore={studentData?.overview?.averageScore || 0}
        />
      </div>
    </div>
  );
};

export default StudentProfilePage;
