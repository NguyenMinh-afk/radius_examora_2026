import React from "react";

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = "md" }) => {
  const s = score ?? 0;
  let colorClass = "text-red-600 bg-red-50";
  if (s >= 8) colorClass = "text-green-600 bg-green-50";
  else if (s >= 6) colorClass = "text-amber-600 bg-amber-50";

  const sizeClass = size === "sm" ? "text-sm px-2 py-0.5" : size === "lg" ? "text-lg px-3 py-1" : "text-sm px-2.5 py-1";

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass}`}>
      {score ?? "-"}
    </span>
  );
};

export default ScoreBadge;
