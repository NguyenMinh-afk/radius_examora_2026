import React, { useState, useCallback } from "react";
import { CheckCircle, Info, XCircle, X } from "lucide-react";
import type { Toast, ToastType } from "./types";
import { ToastContext } from "./useToast";

export type { Toast, ToastType };

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="text-emerald-400 shrink-0" size={20} />,
    error: <XCircle className="text-rose-400 shrink-0" size={20} />,
    info: <Info className="text-blue-400 shrink-0" size={20} />,
  };

  const borderColors: Record<ToastType, string> = {
    success: "border-emerald-500/30",
    error: "border-rose-500/30",
    info: "border-blue-500/30",
  };

  const bgColors: Record<ToastType, string> = {
    success: "bg-emerald-950/80",
    error: "bg-rose-950/80",
    info: "bg-blue-950/80",
  };

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 min-w-[320px] max-w-[420px]
        backdrop-blur-xl border rounded-xl px-4 py-3 shadow-2xl shadow-black/20
        ${borderColors[toast.type]} ${bgColors[toast.type]}
        animate-slide-in-right
      `}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-white/60">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
};
