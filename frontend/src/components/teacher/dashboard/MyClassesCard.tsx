import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Users, BookOpen, ArrowRight } from "lucide-react";

interface MyClass {
  classId: string;
  className: string;
  classCode: string;
  courseName: string;
  semester: string;
  academicYear: string;
  studentCount: number;
  assignmentCount: number;
  averageScore: number;
}

interface MyClassesCardProps {
  classes: MyClass[];
  isDark?: boolean;
}

const MyClassesCard: React.FC<MyClassesCardProps> = ({ classes, isDark }) => {
  return (
    <div className={`rounded-2xl border shadow-sm p-6 ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Lớp học của tôi</h3>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Các lớp đang quản lý</p>
        </div>
        <Link
          to="/teacher/classes"
          className={`flex items-center gap-1 text-sm font-medium ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
        >
          Xem tất cả
          <ArrowRight size={16} />
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
          <GraduationCap size={32} className={`mx-auto mb-2 opacity-50 ${isDark ? "text-gray-600" : ""}`} />
          <p className="text-sm">Chưa có lớp học nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {classes.slice(0, 4).map((cls) => (
            <Link
              key={cls.classId}
              to={`/teacher/classes/${cls.classId}`}
              className={`block p-4 rounded-xl border transition group ${
                isDark
                  ? "border-white/10 hover:border-blue-500/40 hover:bg-white/5"
                  : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className={`text-sm font-semibold truncate group-hover:text-blue-500 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}>
                    {cls.className}
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                    {cls.courseName} · {cls.semester} {cls.academicYear}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? "bg-blue-500/20" : "bg-blue-50"
                }`}>
                  <GraduationCap size={16} className={isDark ? "text-blue-400" : "text-blue-600"} />
                </div>
              </div>
              <div className={`flex items-center gap-3 text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {cls.studentCount} SV
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={12} />
                  {cls.assignmentCount} bài
                </span>
                <span className={`font-medium ${isDark ? "text-emerald-400" : "text-green-600"}`}>
                  TB: {cls.averageScore.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClassesCard;
