import React from "react";
import { useTheme } from "../../../contexts/useTheme";

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  isDark?: boolean;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = "md", isDark: isDarkProp }) => {
  const { theme } = useTheme();
  const isDark = isDarkProp ?? theme === "dark";
  const s = score ?? 0;
  let colorClass: string;

  if (s >= 8) {
    colorClass = isDark ? "text-emerald-400 bg-emerald-500/20" : "text-green-600 bg-green-50";
  } else if (s >= 6) {
    colorClass = isDark ? "text-amber-400 bg-amber-500/20" : "text-amber-600 bg-amber-50";
  } else {
    colorClass = isDark ? "text-red-400 bg-red-500/20" : "text-red-600 bg-red-50";
  }

  const sizeClass = size === "sm" ? "text-sm px-2 py-0.5" : size === "lg" ? "text-lg px-3 py-1" : "text-sm px-2.5 py-1";

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass}`}>
      {score ?? "-"}
    </span>
  );
};

export default ScoreBadge;