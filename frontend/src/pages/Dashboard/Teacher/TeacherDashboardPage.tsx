import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import {
  DashboardHero,
  TeacherOverviewStats,
  UpcomingAssignmentsCard,
  RecentResultsCard,
  MyClassesCard,
  NotificationCard,
} from "../../../components/teacher/dashboard";
import { getTeacherDashboard } from "../../../api/teacherApi";
import type { DashboardData } from "../../../api/teacherApi";

const TeacherDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getTeacherDashboard();
      setData(dashboardData);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      console.error("Error fetching teacher dashboard:", err);
      setError(axiosError.response?.data?.error || (err as Error).message || "Không thể tải dữ liệu");
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
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="h-80 bg-slate-200 rounded-2xl" />
            <div className="h-80 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium mb-3">{error || "Không thể tải dữ liệu dashboard"}</p>
          <button
            onClick={fetchData}
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
      {/* Hero */}
      <DashboardHero
        teacherName={data.teacher?.fullName || data.teacher?.email || "Giảng viên"}
        overview={data.overview ? {
          classCount: data.overview.classCount ?? 0,
          studentCount: data.overview.studentCount ?? 0,
          examCount: data.overview.examCount ?? 0,
          openAssignments: data.overview.openAssignments ?? 0,
          pendingGrades: data.overview.pendingGrades ?? 0,
        } : {
          classCount: 0,
          studentCount: 0,
          examCount: 0,
          openAssignments: 0,
          pendingGrades: 0,
        }}
      />

      {/* Overview Stats */}
      <TeacherOverviewStats
        overview={data.overview ? {
          ...data.overview,
          assignmentCount: data.overview.assignmentCount ?? 0,
          openAssignments: data.overview.openAssignments ?? 0,
          pendingGrades: data.overview.pendingGrades ?? 0,
        } : {
          classCount: 0,
          studentCount: 0,
          examCount: 0,
          assignmentCount: 0,
          openAssignments: 0,
          pendingGrades: 0,
          notificationCount: 0,
        }}
      />

      {/* Content Row 1: Upcoming Assignments + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <UpcomingAssignmentsCard assignments={data.upcomingAssignments || []} />
        <NotificationCard notifications={data.notifications || []} />
      </div>

      {/* Content Row 2: Recent Results + My Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <RecentResultsCard results={data.recentResults || []} />
        <MyClassesCard classes={data.myClasses || []} />
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
