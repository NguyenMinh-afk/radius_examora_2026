import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, Sun, Moon, AlertTriangle } from "lucide-react";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import PasswordStrengthMeter from "../../components/shared/PasswordStrengthMeter";
import { useTheme } from "../../contexts/useTheme";
import { verifyResetToken, resetPassword } from "../../api/axios/User";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!token) {
        setError("Missing reset token.");
        return;
      }

      try {
        const res = await verifyResetToken({ token });
        if (!active) return;

        if (!res.data?.valid) {
          setError("Invalid or expired reset token.");
        }
      } catch (err: unknown) {
        if (!active) return;
        const axiosError = err as {
          response?: { data?: { message?: string; code?: string } };
          message?: string;
        };
        const serverMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Invalid or expired reset token.";
        setError(serverMessage);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resetPassword({ token, password });
      setSuccess(res.data?.message || "Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; code?: string } };
        message?: string;
      };
      const serverMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to reset password.";
      setError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedBackground theme={theme}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
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
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <ShieldCheck className="text-white" size={22} />
              </div>
              <span className={`text-2xl font-bold tracking-tight ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                EXAMORA
              </span>
            </Link>
          </div>

          <div
            className={`rounded-2xl p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 ${
              theme === "light"
                ? "bg-white/80 border border-white/50"
                : "bg-slate-900/60 border border-white/10"
            }`}
          >
            <div className="mb-6">
              <h1 className={`text-xl font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                Reset Password
              </h1>
              <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
                Create a new password for your account.
              </p>
            </div>

            {error && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                  theme === "light"
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                <AlertTriangle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div
                className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                  theme === "light"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {success}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400" : "text-white/30"}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`w-full h-11 pl-10 pr-10 rounded-lg border text-sm outline-none transition ${
                      theme === "light"
                        ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50"
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                      theme === "light" ? "text-slate-400 hover:text-slate-600" : "text-white/30 hover:text-white/60"
                    }`}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrengthMeter password={password} theme={theme} />
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
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                      theme === "light" ? "text-slate-400 hover:text-slate-600" : "text-white/30 hover:text-white/60"
                    }`}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className={`mt-1 text-xs ${theme === "light" ? "text-red-600" : "text-rose-400"}`}>
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-11 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-xl ${
                  theme === "light"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className={`mt-6 text-center text-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
              Remember your password?{" "}
              <Link
                to="/login"
                className={`font-medium transition ${
                  theme === "light" ? "text-blue-600 hover:text-blue-700" : "text-indigo-400 hover:text-indigo-300"
                }`}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default ResetPassword;
