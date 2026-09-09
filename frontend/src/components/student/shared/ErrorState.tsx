import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  isDark?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, isDark }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <AlertCircle size={48} className={`mb-4 ${isDark ? "text-red-400" : "text-red-400"}`} />
      <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition ${
            isDark
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      )}
    </div>
  );
};

export default ErrorState;