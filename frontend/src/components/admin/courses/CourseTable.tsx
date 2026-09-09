import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  EyeOff,
  GraduationCap,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import type { AdminCourse, Pagination } from "../../../api/Admin";

interface CourseTableProps {
  courses: AdminCourse[];
  pagination: Pagination;
  loading: boolean;
  actionCourseId: number | null;
  onPageChange: (page: number) => void;
  onToggleActive: (course: AdminCourse) => void;
  onEditCourse?: (course: AdminCourse) => void;
  onDeleteCourse?: (course: AdminCourse) => void;
  isDark?: boolean;
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
  onEditCourse,
  onDeleteCourse,
  isDark,
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.menu-toggle-btn')) {
        return;
      }
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className={`overflow-hidden rounded-lg border ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className={`text-xs font-semibold uppercase tracking-wide ${
            isDark ? "bg-slate-800 text-gray-400" : "bg-slate-50 text-slate-500"
          }`}>
            <tr>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Course</th>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Faculty</th>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Credits</th>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Semester</th>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Status</th>
              <th className={`px-5 py-4 ${isDark ? "text-gray-400" : ""}`}>Created</th>
              <th className={`px-5 py-4 text-right ${isDark ? "text-gray-400" : ""}`}>Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-100"}`}>
            {loading ? (
              <tr>
                <td className={`px-5 py-12 text-center ${isDark ? "text-gray-500" : "text-slate-500"}`} colSpan={7}>
                  Loading courses...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td className={`px-5 py-12 text-center ${isDark ? "text-gray-500" : "text-slate-500"}`} colSpan={7}>
                  No courses match the current filters.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className={`transition ${
                  isDark ? "bg-slate-900 hover:bg-slate-800" : "bg-white hover:bg-slate-50/70"
                }`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-700"
                      }`}>
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{course.name}</div>
                        <div className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-slate-500"}`}>{course.code}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isDark ? "bg-slate-800 text-gray-400" : "bg-slate-100 text-slate-600"
                    }`}>
                      <GraduationCap size={13} />
                      Faculty #{course.faculty_id}
                    </span>
                  </td>

                  <td className={`px-5 py-4 font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{course.credits}</td>

                  <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{course.semester_type || "General"}</td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        course.is_active
                          ? isDark ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30" : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : isDark ? "bg-slate-700 text-gray-400 ring-slate-600" : "bg-slate-100 text-slate-500 ring-slate-200"
                      }`}
                    >
                      {course.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                      {course.is_active ? "Visible" : "Hidden"}
                    </span>
                  </td>

                  <td className={`px-5 py-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{formatDate(course.created_at)}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={actionCourseId === course.id}
                        onClick={() => onToggleActive(course)}
                        className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          course.is_active
                            ? isDark
                              ? "border border-white/10 bg-slate-800 text-white hover:bg-slate-700"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {course.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                        {course.is_active ? "Hide" : "Show"}
                      </button>

                      <div className="relative" ref={menuContainerRef}>
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                          className={`menu-toggle-btn inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
                            isDark
                              ? "border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          } ${openMenuId === course.id ? (isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700") : ""}`}
                          aria-label={`Open actions for ${course.name}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        <div
                          className={`${openMenuId === course.id ? 'block' : 'hidden'} absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border shadow-lg ${
                            isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCourse?.(course);
                              setOpenMenuId(null);
                            }}
                            className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition first:rounded-t-lg ${
                              isDark
                                ? "text-gray-300 hover:bg-white/5 hover:text-white"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Edit2 size={15} />
                            Edit Course
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCourse?.(course);
                              setOpenMenuId(null);
                            }}
                            className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition last:rounded-b-lg ${
                              isDark
                                ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                                : "text-rose-600 hover:bg-rose-50"
                            }`}
                          >
                            <Trash2 size={15} />
                            Delete Course
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
        isDark ? "border-white/10" : "border-slate-100"
      }`}>
        <div className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
          Showing page <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.page}</span> of{" "}
          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.totalPages || 1}</span>,{" "}
          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>{pagination.total}</span> total courses
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => onPageChange(pagination.page - 1)}
            className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDark
                ? "border-white/10 text-gray-300 hover:bg-white/5"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ChevronLeft size={15} />
            Previous
          </button>

          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || loading || pagination.totalPages === 0}
            onClick={() => onPageChange(pagination.page + 1)}
            className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDark
                ? "border-white/10 text-gray-300 hover:bg-white/5"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
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
