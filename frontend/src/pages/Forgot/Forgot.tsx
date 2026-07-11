import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, Sun, Moon, Lock, KeyRound, X } from "lucide-react";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import PasswordStrengthMeter from "../../components/shared/PasswordStrengthMeter";
import { useTheme } from "../../contexts/useTheme";

const Forgot: React.FC = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOtpModal(true);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password reset successfully!");
    setShowOtpModal(false);
  };

  return (
    <AnimatedBackground theme={theme}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        {/* Theme Toggle - Fixed Top Right */}
        <button
          onClick={toggleTheme}
          className={`fixed top-4 right-4 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${
            theme === "light"
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="w-full max-w-md animate-scale-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <ShieldCheck className="text-white" size={22} />
              </div>
              <span className={`text-2xl font-bold tracking-tight ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                EXMORA
              </span>
            </Link>
          </div>

          {/* Card */}
          <div
            className={`rounded-2xl p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 ${
              theme === "light"
                ? "bg-white/80 border border-white/50"
                : "bg-slate-900/60 border border-white/10"
            }`}
          >
            <div className="mb-6">
              <h1 className={`text-xl font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                Forgot Password
              </h1>
              <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSendResetLink}>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400" : "text-white/30"}`} />
                  <input
                    type="email"
                    placeholder="name@institution.edu"
                    className={`w-full h-11 pl-10 pr-4 rounded-lg border text-sm outline-none transition ${
                      theme === "light"
                        ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50 focus:bg-white/10"
                    }`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full h-11 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xl ${
                  theme === "light"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40"
                }`}
              >
                <Mail size={16} />
                Send Reset Link
              </button>
            </form>

            {/* Back to Login */}
            <div className="text-center mt-6">
              <Link
                to="/login"
                className={`text-sm ${theme === "light" ? "text-slate-500 hover:text-blue-600" : "text-white/50 hover:text-indigo-400"} transition`}
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div
            className={`rounded-2xl p-8 w-full max-w-md shadow-2xl ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === "light" ? "bg-blue-100 text-blue-600" : "bg-indigo-500/20 text-indigo-400"}`}>
                  <KeyRound size={20} />
                </div>
                <h3 className={`text-lg font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                  Reset Your Password
                </h3>
              </div>
              <button
                onClick={() => setShowOtpModal(false)}
                className={`p-2 rounded-lg transition ${
                  theme === "light" ? "hover:bg-slate-100 text-slate-400" : "hover:bg-slate-800 text-white/50"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <p className={`text-sm mb-6 ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
              Enter the OTP sent to your email and set a new password.
            </p>

            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className={`w-full h-11 px-4 rounded-lg border text-sm outline-none transition ${
                    theme === "light"
                      ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400" : "text-white/30"}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`w-full h-11 pl-10 pr-10 rounded-lg border text-sm outline-none transition ${
                      theme === "light"
                        ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400 hover:text-slate-600" : "text-white/30 hover:text-white/60"}`}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <PasswordStrengthMeter password={newPassword} theme={theme} />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400" : "text-white/30"}`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`w-full h-11 pl-10 pr-10 rounded-lg border text-sm outline-none transition ${
                      theme === "light"
                        ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400 hover:text-slate-600" : "text-white/30 hover:text-white/60"}`}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className={`mt-1 text-xs ${theme === "light" ? "text-red-600" : "text-rose-400"}`}>
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className={`flex-1 h-11 rounded-lg font-medium border transition ${
                    theme === "light"
                      ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                      : "border-white/10 text-white/70 hover:bg-white/5"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 h-11 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xl ${
                    theme === "light"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                      : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  }`}
                >
                  <Lock size={16} />
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedBackground>
  );
};

export default Forgot;
