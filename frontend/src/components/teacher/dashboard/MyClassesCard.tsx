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
}

const MyClassesCard: React.FC<MyClassesCardProps> = ({ classes }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Lớp học của tôi</h3>
          <p className="text-sm text-slate-500 mt-0.5">Các lớp đang quản lý</p>
        </div>
        <Link
          to="/teacher/classes"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Xem tất cả
          <ArrowRight size={16} />
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <GraduationCap size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có lớp học nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {classes.slice(0, 4).map((cls) => (
            <Link
              key={cls.classId}
              to={`/teacher/classes/${cls.classId}`}
              className="block p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700">
                    {cls.className}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cls.courseName} · {cls.semester} {cls.academicYear}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={16} className="text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {cls.studentCount} SV
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={12} />
                  {cls.assignmentCount} bài
                </span>
                <span className="font-medium text-green-600">
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
