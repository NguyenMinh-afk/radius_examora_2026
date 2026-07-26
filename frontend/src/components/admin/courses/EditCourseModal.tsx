import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { AdminCourse } from "../../../api/Admin";

interface EditCourseModalProps {
  course: AdminCourse;
  onClose: () => void;
  onSave: (courseId: number, data: { name: string; code: string; description: string; credits: number; semester_type: string }) => Promise<void>;
  isDark?: boolean;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSave, isDark }) => {
  const [name, setName] = useState(course.name || "");
  const [code, setCode] = useState(course.code || "");
  const [description, setDescription] = useState(course.description || "");
  const [credits, setCredits] = useState(course.credits || 0);
  const [semesterType, setSemesterType] = useState(course.semester_type || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || credits <= 0) return;

    setSaving(true);
    await onSave(course.id, {
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      credits,
      semester_type: semesterType.trim(),
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-md rounded-xl border shadow-2xl ${
          isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
        }`}
      >
        <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Edit Course
          </h2>
          <button
            onClick={onClose}
            className={`rounded-md p-1.5 transition ${
              isDark ? "text-gray-400 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
              Course Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
              Course Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
              Credits
            </label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              required
              min={1}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
              Semester Type
            </label>
            <select
              value={semesterType}
              onChange={(e) => setSemesterType(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                isDark
                  ? "bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-100"
              }`}
            >
              <option value="">General</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>

          <div>
            <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                isDark
                  ? "border-white/10 text-gray-300 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !code.trim()}
              className={`rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditCourseModal;
