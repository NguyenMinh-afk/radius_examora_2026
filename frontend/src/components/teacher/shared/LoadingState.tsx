import React from "react";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ size = "md", text = "Đang tải..." }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4`} />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
};

export default LoadingState;
