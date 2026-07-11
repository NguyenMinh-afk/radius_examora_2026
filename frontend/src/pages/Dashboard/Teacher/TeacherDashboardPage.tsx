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
import { useTheme } from "../../../contexts/useTheme";

const TeacherDashboardPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
      <div className="animate-pulse space-y-6">
        <div className={`h-48 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-28 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className={`h-80 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
          <div className={`h-80 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`rounded-xl border p-6 text-center ${
        isDark
          ? "bg-red-500/10 border-red-500/30"
          : "bg-red-50 border-red-200"
      }`}>
        <p className={`font-medium mb-3 ${isDark ? "text-red-400" : "text-red-600"}`}>
          {error || "Không thể tải dữ liệu dashboard"}
        </p>
        <button
          onClick={fetchData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
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

      <TeacherOverviewStats
        isDark={isDark}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <UpcomingAssignmentsCard
          assignments={data.upcomingAssignments || []}
          isDark={isDark}
        />
        <NotificationCard
          notifications={data.notifications || []}
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentResultsCard
          results={data.recentResults || []}
          isDark={isDark}
        />
        <MyClassesCard
          classes={data.myClasses || []}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
