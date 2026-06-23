import React from "react";

interface UnreadBadgeProps {
  count: number;
  max?: number;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, max = 99 }) => {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center min-w-[20px] px-1">
      {count > max ? `${max}+` : count}
    </span>
  );
};

export default UnreadBadge;
