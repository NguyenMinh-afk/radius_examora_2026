import React, { useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  X,
} from "lucide-react";

import type { AdminCourse, Pagination } from "../../api/Admin";
import ConfirmDialog from "./ConfirmDialog";

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

const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  pagination,
  loading,
  actionCourseId,
  onPageChange,
  onToggleActive,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const [pendingCourse, setPendingCourse] = useState<AdminCourse | null>(null);

  const handleConfirmVisibility = () => {
    if (!pendingCourse) return;
    onToggleActive(pendingCourse);
    setPendingCourse(null);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <ConfirmDialog
        open={Boolean(pendingCourse)}
        title={pendingCourse?.is_active ? "Hide course" : "Show course"}
        message={
          pendingCourse
            ? `${pendingCourse.is_active ? "Hide" : "Show"} course ${pendingCourse.name}?`
            : ""
        }
        confirmText={pendingCourse?.is_active ? "Hide course" : "Show course"}
        tone={pendingCourse?.is_active ? "danger" : "primary"}
        loading={Boolean(pendingCourse && actionCourseId === pendingCourse.id)}
        onCancel={() => setPendingCourse(null)}
        onConfirm={handleConfirmVisibility}
      />
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Course Detail</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Read-only overview for admin monitoring.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                aria-label="Close course detail"
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[calc(86vh-73px)] overflow-y-auto p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                  <BookOpen size={22} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-950">{selectedCourse.name}</div>
                  <div className="text-sm font-medium text-slate-500">{selectedCourse.code}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Course ID
                  </div>
                  <div className="mt-2 font-mono text-sm text-slate-700">#{selectedCourse.id}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Faculty
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    Faculty #{selectedCourse.faculty_id}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Credits
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    {selectedCourse.credits}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Semester
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    {selectedCourse.semester_type || "General"}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        selectedCourse.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-100 text-slate-500 ring-slate-200"
                      }`}
                    >
                      {selectedCourse.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                      {selectedCourse.is_active ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Created
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    {formatDate(selectedCourse.created_at)}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Description
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {selectedCourse.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                        onClick={() => setPendingCourse(course)}
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
                        onClick={() => setSelectedCourse(course)}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        aria-label={`View ${course.name}`}
                      >
                        <Eye size={15} />
                        View
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
};

export default CourseTable;
