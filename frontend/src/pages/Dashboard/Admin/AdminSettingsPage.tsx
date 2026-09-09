import React, { useState } from "react";
import { AlertCircle, Check, Loader2, Save } from "lucide-react";
import AdminSidebar from "../../../components/admin/layout/AdminSidebar";
import { getCurrentUser, updateCurrentUser } from "../../../utils/auth";
import { useTheme } from "../../../contexts/useTheme";

const AdminSettingsPage: React.FC = () => {
  const currentUser = getCurrentUser();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [fullName, setFullName] = useState(currentUser?.full_name || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // Simulate API call - in real app, call backend API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateCurrentUser({ full_name: fullName });
      setSuccess("Profile updated successfully!");
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <AdminSidebar />

      <main className={`flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-7 ${isDark ? "text-white" : "text-slate-900"}`}>
        <div className="mb-8">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>Settings</h1>
          <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>Manage your admin account settings</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Account Settings */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-lg font-bold mb-6 ${isDark ? "text-white" : "text-slate-950"}`}>Account Information</h2>

            {success && (
              <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
                isDark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}>
                <Check size={18} />
                {success}
              </div>
            )}

            {error && (
              <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
                isDark ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : "border-rose-200 bg-rose-50 text-rose-700"
              }`}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full h-11 rounded-lg border px-4 text-sm outline-none focus:ring-2 transition ${
                    isDark
                      ? "bg-slate-800 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                      : "bg-white border-slate-200 text-slate-700 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                  className={`w-full h-11 rounded-lg border px-4 text-sm outline-none cursor-not-allowed ${
                    isDark
                      ? "bg-slate-800/50 border-white/10 text-gray-500"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="Enter your email"
                />
                <p className={`mt-1 text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                  Email cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                  Role
                </label>
                <input
                  type="text"
                  value="Administrator"
                  disabled
                  className={`w-full h-11 rounded-lg border px-4 text-sm outline-none cursor-not-allowed capitalize ${
                    isDark
                      ? "bg-slate-800/50 border-white/10 text-gray-500"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Info */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-950"}`}>Security</h2>
            <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              For security reasons, password changes and account deletion must be done by a super administrator.
            </p>
            <div className={`p-4 rounded-lg border ${
              isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"
            }`}>
              <p className={`text-sm ${isDark ? "text-amber-400" : "text-amber-800"}`}>
                <strong>Note:</strong> As an admin account, please ensure you follow security best practices and keep your login credentials secure.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
