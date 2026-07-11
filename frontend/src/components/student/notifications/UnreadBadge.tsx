import React from "react";
import { useTheme } from "../../../contexts/useTheme";

interface UnreadBadgeProps {
  count: number;
  max?: number;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, max = 99 }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (count <= 0) return null;

  return (
    <span className={`absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center min-w-[20px] px-1 ${
      isDark ? "bg-red-500" : "bg-red-500"
    }`}>
      {count > max ? `${max}+` : count}
    </span>
  );
};

export default UnreadBadge;