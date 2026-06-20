import React from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";

import type { AdminCourse, Pagination } from "../../api/axios/Admin";

interface CourseTableProps {
  courses: AdminCourse[];
  pagination: Pagination;
  loading: boolean;
  actionCourseId: number | null;
  onPageChange: (page: number) => void;
  onToggleActive: (course: AdminCourse) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const confirmCourseVisibility = (
  course: AdminCourse,
  onToggleActive: (course: AdminCourse) => void
) => {
  const action = course.is_active ? "ẩn" : "hiện";
  const approved = window.confirm(
    `Bạn có chắc muốn ${action} khóa học ${course.name} không?`
  );

  if (approved) {
    onToggleActive(course);
  }
};

const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  pagination,
  loading,
  actionCourseId,
  onPageChange,
  onToggleActive,
}) => (
  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4">Course</th>
            <th className="px-5 py-4">Faculty</th>
            <th className="px-5 py-4">Credits</th>
            <th className="px-5 py-4">Semester</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Created</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td className="px-5 py-12 text-center text-slate-500" colSpan={7}>
                Loading courses...
              </td>
            </tr>
          ) : courses.length === 0 ? (
            <tr>
              <td className="px-5 py-12 text-center text-slate-500" colSpan={7}>
                No courses match the current filters.
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr key={course.id} className="bg-white transition hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{course.name}</div>
                      <div className="text-xs font-medium text-slate-500">{course.code}</div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    <GraduationCap size={13} />
                    Faculty #{course.faculty_id}
                  </span>
                </td>

                <td className="px-5 py-4 font-semibold text-slate-700">{course.credits}</td>

                <td className="px-5 py-4 text-slate-500">{course.semester_type || "General"}</td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                      course.is_active
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-slate-100 text-slate-500 ring-slate-200"
                    }`}
                  >
                    {course.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                    {course.is_active ? "Visible" : "Hidden"}
                  </span>
                </td>

                <td className="px-5 py-4 text-slate-500">{formatDate(course.created_at)}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={actionCourseId === course.id}
                      onClick={() => confirmCourseVisibility(course, onToggleActive)}
                      className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        course.is_active
                          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {course.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                      {course.is_active ? "Hide" : "Show"}
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                      aria-label={`Open actions for ${course.name}`}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        Showing page <span className="font-semibold text-slate-700">{pagination.page}</span> of{" "}
        <span className="font-semibold text-slate-700">{pagination.totalPages || 1}</span>,{" "}
        <span className="font-semibold text-slate-700">{pagination.total}</span> total courses
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1 || loading}
          onClick={() => onPageChange(pagination.page - 1)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={15} />
          Previous
        </button>

        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages || loading || pagination.totalPages === 0}
          onClick={() => onPageChange(pagination.page + 1)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  </div>
);

export default CourseTable;
