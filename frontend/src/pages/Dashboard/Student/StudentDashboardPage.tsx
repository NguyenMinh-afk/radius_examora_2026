import React, { useState, useEffect } from "react";
import { getStudentDashboard, type DashboardData } from "../../../api/studentApi";
import {
  DashboardHero,
  DashboardOverviewStats,
  NextAssignmentCard,
  MyClassesCard,
  RecentResultsCard,
  QuickActionsCard,
} from "../../../components/student/dashboard";
import { LoadingState, ErrorState } from "../../../components/student/shared";

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StudentDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getStudentDashboard();
      setData(dashboardData);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      console.error("Error fetching dashboard:", err);
      setError(axiosError.response?.data?.error || axiosError.message || "Không thể tải dữ liệu dashboard");
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
        <LoadingState size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <ErrorState message={error || "Không thể tải dữ liệu dashboard"} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <DashboardHero
        studentName={data.student?.fullName || "Học sinh"}
        overview={data.overview || { classCount: 0, upcomingAssignments: 0, openAssignments: 0, averageScore: 0 }}
        nextAssignmentTitle={data.nextAssignment?.title}
        nextAssignmentTime={data.nextAssignment?.startTime ? formatDateTime(data.nextAssignment.startTime) : undefined}
      />

      <DashboardOverviewStats overview={data.overview || { classCount: 0, upcomingAssignments: 0, openAssignments: 0, averageScore: 0 }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {data.nextAssignment && (
          <NextAssignmentCard assignment={data.nextAssignment} />
        )}
        {data.myClasses && data.myClasses.length > 0 && (
          <MyClassesCard classes={data.myClasses} maxDisplay={4} />
        )}
      </div>

      <div className="mt-8">
        <RecentResultsCard results={data.recentResults || []} />
      </div>

      <div className="mt-8">
        <QuickActionsCard />
      </div>
    </div>
  );
};

export default StudentDashboardPage;
