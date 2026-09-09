import React from "react";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  isDark?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6 border-2",
  md: "h-12 w-12 border-4",
  lg: "h-16 w-16 border-4",
};

const LoadingState: React.FC<LoadingStateProps> = ({ size = "md", text, isDark }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{text}</p>}
    </div>
  );
};

export default LoadingState;