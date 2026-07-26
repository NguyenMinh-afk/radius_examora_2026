import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { AdminCourse } from "../../../api/Admin";

interface DeleteCourseDialogProps {
  course: AdminCourse;
  onClose: () => void;
  onConfirm: (courseId: number) => Promise<void>;
  isDark?: boolean;
}

const DeleteCourseDialog: React.FC<DeleteCourseDialogProps> = ({ course, onClose, onConfirm, isDark }) => {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm(course.id);
    setConfirming(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-sm rounded-xl border shadow-2xl ${
          isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
        }`}
      >
        <div className="p-6">
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isDark ? "bg-rose-500/20" : "bg-rose-50"
          }`}>
            <Trash2 className={`h-6 w-6 ${isDark ? "text-rose-400" : "text-rose-600"}`} />
          </div>
          <h2 className={`mb-2 text-center text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Delete Course?
          </h2>
          <p className={`mb-6 text-center text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            Are you sure you want to delete <span className="font-semibold">{course.name}</span>? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                isDark
                  ? "border-white/10 text-gray-300 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirming ? "Deleting..." : "Delete Course"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteCourseDialog;
