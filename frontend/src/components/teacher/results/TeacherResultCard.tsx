import React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import type { Result } from "../../../api/teacherApi";
import StatusBadge from "../shared/StatusBadge";

interface TeacherResultCardProps {
  result: Result;
}

const getScoreColor = (percentage: number | null) => {
  if (percentage === null) return "text-slate-400";
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-amber-600";
  return "text-red-600";
};

const getScoreBg = (percentage: number | null) => {
  if (percentage === null) return "bg-slate-50";
  if (percentage >= 80) return "bg-green-50";
  if (percentage >= 60) return "bg-amber-50";
  return "bg-red-50";
};

const TeacherResultCard: React.FC<TeacherResultCardProps> = ({ result }) => {
  const scoreColor = getScoreColor(result.percentage);
  const scoreBg = getScoreBg(result.percentage);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-blue-200 transition">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {result.studentName.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{result.studentName}</h4>
            <StatusBadge status={result.status === "graded" ? "graded" : "submitted"} />
          </div>
          <p className="text-xs text-slate-500 truncate">
            {result.examName} · {result.className} · {result.studentCode}
          </p>
        </div>

        {/* Score */}
        <div className={`text-center px-4 py-2 rounded-xl ${scoreBg} flex-shrink-0`}>
          {result.score !== null ? (
            <>
              <p className={`text-lg font-bold ${scoreColor}`}>{result.score.toFixed(1)}</p>
              <p className={`text-xs font-medium ${scoreColor}`}>{result.percentage}%</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">—</p>
          )}
        </div>

        {/* Details */}
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1">
            <CheckCircle size={12} className="text-green-500" />
            {result.correctAnswers}
          </span>
          <span className="flex items-center gap-1">
            <XCircle size={12} className="text-red-500" />
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
