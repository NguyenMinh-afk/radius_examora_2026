import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ChevronRight } from "lucide-react";
import type { MyClass } from "../../../api/studentApi";
import { useTheme } from "../../../contexts/useTheme";

interface MyClassesCardProps {
  classes: MyClass[];
  maxDisplay?: number;
}

const MyClassesCard: React.FC<MyClassesCardProps> = ({ classes, maxDisplay = 4 }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const displayedClasses = classes.slice(0, maxDisplay);

  return (
    <div className={`rounded-xl shadow-sm border ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className={`p-5 border-b flex items-center justify-between ${
        isDark ? "border-white/10" : "border-slate-100"
      }`}>
        <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <GraduationCap size={20} className="text-indigo-500" />
          Lớp học của tôi
        </h2>
        <Link
          to="/student/classes"
          className={`text-sm flex items-center gap-1 ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
        >
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>
      <div className="p-5 space-y-4">
        {displayedClasses.length > 0 ? (
          displayedClasses.map((cls) => (
            <Link
              key={cls.classId}
              to={`/student/classes/${cls.classId}`}
              className={`block p-4 border rounded-lg transition ${
                isDark
                  ? "border-white/10 hover:border-indigo-500/40 hover:bg-white/5"
                  : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{cls.className}</h4>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    <span className="font-medium">{cls.courseName || "Chưa có môn"}</span> • GV: {cls.teacherName}
                  </p>
                </div>
                <ChevronRight size={18} className={isDark ? "text-gray-500 mt-1" : "text-gray-400 mt-1"} />
              </div>
            </Link>
          ))
        ) : (
          <div className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            <GraduationCap size={40} className="mx-auto mb-2 opacity-50" />
            <p>Chưa tham gia lớp học nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClassesCard;