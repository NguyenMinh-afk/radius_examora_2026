import React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import type { Result } from "../../../api/teacherApi";
import StatusBadge from "../shared/StatusBadge";

interface TeacherResultCardProps {
  result: Result;
  isDark?: boolean;
}

const getScoreColor = (percentage: number | null, isDark?: boolean) => {
  if (percentage === null) return isDark ? "text-gray-500" : "text-slate-400";
  if (percentage >= 80) return isDark ? "text-emerald-400" : "text-green-600";
  if (percentage >= 60) return isDark ? "text-amber-400" : "text-amber-600";
  return isDark ? "text-red-400" : "text-red-600";
};

const getScoreBg = (percentage: number | null, isDark?: boolean) => {
  if (percentage === null) return isDark ? "bg-slate-800" : "bg-slate-50";
  if (percentage >= 80) return isDark ? "bg-emerald-500/20" : "bg-green-50";
  if (percentage >= 60) return isDark ? "bg-amber-500/20" : "bg-amber-50";
  return isDark ? "bg-red-500/20" : "bg-red-50";
};

const TeacherResultCard: React.FC<TeacherResultCardProps> = ({ result, isDark }) => {
  const scoreColor = getScoreColor(result.percentage, isDark);
  const scoreBg = getScoreBg(result.percentage, isDark);

  return (
    <div className={`rounded-xl border shadow-sm p-5 transition ${
      isDark
        ? "bg-slate-900 border-white/10 hover:border-blue-500/40"
        : "bg-white border-slate-200 hover:border-blue-200"
    }`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {result.studentName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{result.studentName}</h4>
            <StatusBadge status={result.status === "graded" ? "graded" : "submitted"} isDark={isDark} />
          </div>
          <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            {result.examName} · {result.className} · {result.studentCode}
          </p>
        </div>

        <div className={`text-center px-4 py-2 rounded-xl flex-shrink-0 ${scoreBg}`}>
          {result.score !== null ? (
            <>
              <p className={`text-lg font-bold ${scoreColor}`}>{result.score.toFixed(1)}</p>
              <p className={`text-xs font-medium ${scoreColor}`}>{result.percentage}%</p>
            </>
          ) : (
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-slate-400"}`}>—</p>
          )}
        </div>

        <div className={`flex items-center gap-3 text-xs flex-shrink-0 ${isDark ? "text-gray-400" : "text-slate-400"}`}>
          <span className="flex items-center gap-1">
            <CheckCircle size={12} className={isDark ? "text-emerald-400" : "text-green-500"} />
            {result.correctAnswers}
          </span>
          <span className="flex items-center gap-1">
            <XCircle size={12} className={isDark ? "text-red-400" : "text-red-500"} />
            {result.wrongAnswers}
          </span>
          {result.timeTaken !== null && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {result.timeTaken}p
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherResultCard;
