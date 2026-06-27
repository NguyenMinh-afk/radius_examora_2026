import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Đã xảy ra lỗi khi tải dữ liệu",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <p className="text-base font-medium text-slate-700 mb-4 text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-blue-600 text-white font-medium rounded-lg px-5 py-2.5 hover:bg-blue-700 transition"
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      )}
    </div>
  );
};

export default ErrorState;
