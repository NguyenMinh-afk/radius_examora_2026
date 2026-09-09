import React, { useState, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { getSchedule } from "../../../api/teacherApi";
import type { ScheduleItem } from "../../../api/teacherApi";
import { LoadingState, ErrorState } from "../../../components/teacher/shared";
import { useTheme } from "../../../contexts/useTheme";

type ViewMode = "month" | "week" | "list";

const TeacherSchedulePage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      let year = selectedYear;
      let month = selectedMonth;

      if (viewMode === "month") {
        year = currentDate.getFullYear();
        month = currentDate.getMonth() + 1;
      }

      const data = await getSchedule(year, month);
      setSchedule(data.items);
    } catch (err) {
      setError((err as Error).message || "Không thể tải lịch thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentDate, selectedYear, selectedMonth, viewMode]);

  // Filter data locally
  const filteredSchedule = useMemo(() => {
    let filtered = [...schedule];

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => new Date(item.startTime) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.startTime) <= toDate);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    return filtered;
  }, [schedule, dateFrom, dateTo, selectedStatus]);

  // Year options (current year - 5 to + 2)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 5; y <= currentYear + 2; y++) {
      years.push(y);
    }
    return years;
  }, []);

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getScheduleForDay = (day: number) => {
    return filteredSchedule.filter((item) => {
      const itemDate = new Date(item.startTime);
      return (
        itemDate.getDate() === day &&
        itemDate.getMonth() === currentDate.getMonth() &&
        itemDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth() + 1);
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedStatus("all");
  };

  const days = getDaysInMonth(currentDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return isDark
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-green-100 text-green-700";
      case "upcoming":
        return isDark
          ? "bg-blue-500/20 text-blue-400"
          : "bg-blue-100 text-blue-700";
      case "closed":
        return isDark
          ? "bg-slate-700 text-gray-300"
          : "bg-gray-100 text-gray-600";
      default:
        return isDark
          ? "bg-slate-700 text-gray-300"
          : "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Đang mở";
      case "upcoming": return "Sắp tới";
      case "closed": return "Đã đóng";
      default: return status;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Lịch thi</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            Quản lý và xem lịch thi theo ngày/tháng
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className={`flex rounded-lg p-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                viewMode === "month"
                  ? isDark
                    ? "bg-slate-700 shadow text-blue-400"
                    : "bg-white shadow text-blue-600"
                  : isDark
                    ? "text-gray-300"
                    : "text-slate-600"
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                viewMode === "list"
                  ? isDark
                    ? "bg-slate-700 shadow text-blue-400"
                    : "bg-white shadow text-blue-600"
                  : isDark
                    ? "text-gray-300"
                    : "text-slate-600"
              }`}
            >
              Danh sách
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition ${
              showFilters
                ? isDark
                  ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                  : "bg-blue-50 border-blue-200 text-blue-600"
                : isDark
                  ? "border-white/10 text-gray-300 hover:bg-slate-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={`rounded-xl border p-4 mb-6 ${
          isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Bộ lọc</h3>
            <button
              onClick={clearFilters}
              className={`text-sm flex items-center gap-1 ${
                isDark ? "text-gray-400 hover:text-red-400" : "text-slate-500 hover:text-red-500"
              }`}
            >
              <X size={14} />
              Xóa lọc
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Year */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-700"}`}>Năm</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1));
                }}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-slate-800 border-white/10 text-white"
                    : "bg-white border-slate-200"
                }`}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-700"}`}>Tháng</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(parseInt(e.target.value));
                  setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value) - 1, 1));
                }}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-slate-800 border-white/10 text-white"
                    : "bg-white border-slate-200"
                }`}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-700"}`}>Trạng thái</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-slate-800 border-white/10 text-white"
                    : "bg-white border-slate-200"
                }`}
              >
                <option value="all">Tất cả</option>
                <option value="open">Đang mở</option>
                <option value="upcoming">Sắp tới</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-slate-700"}`}>Từ ngày - Đến ngày</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-slate-800 border-white/10 text-white"
                      : "bg-white border-slate-200"
                  }`}
                />
                <span className={isDark ? "text-gray-500" : "text-slate-400"}>-</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-slate-800 border-white/10 text-white"
                      : "bg-white border-slate-200"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "month" && (
        <div className={`rounded-2xl shadow-sm border p-6 ${
          isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
        }`}>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className={`p-2 rounded-lg transition ${
                isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
              }`}
            >
              <ChevronLeft size={20} className={isDark ? "text-gray-400" : "text-slate-600"} />
            </button>
            <div className="flex items-center gap-4">
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToToday}
                className={`text-sm font-medium ${
                  isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Hôm nay
              </button>
            </div>
            <button
              onClick={nextMonth}
              className={`p-2 rounded-lg transition ${
                isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
              }`}
            >
              <ChevronRight size={20} className={isDark ? "text-gray-400" : "text-slate-600"} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className={`text-center text-sm font-medium py-2 ${
                  isDark ? "text-gray-400" : "text-slate-500"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <LoadingState size="md" text="Đang tải lịch thi..." isDark={isDark} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchSchedule} isDark={isDark} />
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const daySchedule = day ? getScheduleForDay(day) : null;
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[90px] p-2 border rounded-lg
                      ${day
                        ? isDark
                          ? "bg-slate-900 border-white/10"
                          : "bg-white border-slate-100"
                        : isDark
                          ? "bg-slate-950/50 border-white/5"
                          : "bg-slate-50 border-slate-100"
                      }
                      ${isToday
                        ? isDark
                          ? "ring-2 ring-blue-400"
                          : "ring-2 ring-blue-500"
                        : ""}
                    `}
                  >
                    {day && (
                      <>
                        <span
                          className={`
                            text-sm font-medium
                            ${isToday
                              ? isDark
                                ? "text-blue-400"
                                : "text-blue-600"
                              : isDark
                                ? "text-gray-200"
                                : "text-slate-700"
                            }
                          `}
                        >
                          {day}
                        </span>
                        {daySchedule && daySchedule.length > 0 && (
                          <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
                            {daySchedule.slice(0, 3).map((item) => (
                              <div
                                key={item.assignmentId}
                                className={`text-xs p-1 rounded truncate ${
                                  isDark
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                                title={`${item.examTitle} (${item.className})`}
                              >
                                {item.examTitle}
                              </div>
                            ))}
                            {daySchedule.length > 3 && (
                              <span className={`text-xs ${
                                isDark ? "text-gray-400" : "text-slate-500"
                              }`}>
                                +{daySchedule.length - 3} khác
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${
          isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
        }`}>
          {loading ? (
            <div className="p-8">
              <LoadingState size="lg" text="Đang tải lịch thi..." isDark={isDark} />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState message={error} onRetry={fetchSchedule} isDark={isDark} />
            </div>
          ) : filteredSchedule.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar size={48} className={`mx-auto mb-3 ${
                isDark ? "text-slate-600" : "text-slate-300"
              }`} />
              <p className={isDark ? "text-gray-400" : "text-slate-500"}>Không có lịch thi nào</p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-100"}`}>
              {filteredSchedule.map((item) => (
                <div
                  key={item.assignmentId}
                  className={`p-4 transition ${
                    isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{item.examTitle}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <div className={`flex items-center gap-4 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(item.startTime)}
                        </span>
                        <span>
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </span>
                        <span>Lớp: {item.className}</span>
                        <span>{item.studentCount} sinh viên</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className={`mt-4 flex items-center gap-6 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-green-500"></span>
          <span>Đang mở</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-500"></span>
          <span>Sắp tới</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-gray-400"></span>
          <span>Đã đóng</span>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedulePage;
