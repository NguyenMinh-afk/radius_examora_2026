import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ChevronRight } from "lucide-react";
import type { MyClass } from "../../../api/studentApi";

interface MyClassesCardProps {
  classes: MyClass[];
  maxDisplay?: number;
}

const MyClassesCard: React.FC<MyClassesCardProps> = ({ classes, maxDisplay = 4 }) => {
  const displayedClasses = classes.slice(0, maxDisplay);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <GraduationCap size={20} className="text-indigo-600" />
          Lớp học của tôi
        </h2>
        <Link
          to="/student/classes"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
              className="block p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">{cls.courseName || "Chưa có môn"}</span> • GV: {cls.teacherName}
                  </p>
                </div>
                <ChevronRight size={18} className="text-gray-400 mt-1" />
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <GraduationCap size={40} className="mx-auto mb-2 opacity-50" />
            <p>Chưa tham gia lớp học nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClassesCard;
