import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, Sun, Moon, AlertTriangle, Key, Mail } from "lucide-react";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import PasswordStrengthMeter from "../../components/shared/PasswordStrengthMeter";
import { useTheme } from "../../contexts/useTheme";
import { verifyResetToken, verifyOTP, resetPassword } from "../../api/axios/User";

type ResetMode = "otp" | "password";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [mode, setMode] = useState<ResetMode>("otp");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (token) {
      verifyTokenOnly();
    }
  }, [token]);

  const verifyTokenOnly = async () => {
    if (!token) return;

    setIsVerifying(true);
    try {
      const res = await verifyResetToken({ token });
      if (res.data?.valid) {
        setMode("password");
        setVerified(true);
      } else {
        setError("Invalid or expired reset link.");
      }
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; code?: string } };
        message?: string;
      };
      setError(axiosError.response?.data?.message || "Invalid or expired reset link.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !otp) {
      setError("Please enter your email and OTP code.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyOTP({ email, otp });
      if (res.data?.valid) {
        setVerified(true);
        setMode("password");
        setSuccess("OTP verified! Now you can set a new password.");
      }
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; code?: string } };
        message?: string;
      };
      const msg = axiosError.response?.data?.message || "Invalid or expired OTP.";
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      let payload: { token?: string; email?: string; password: string };
      if (token) {
        payload = { token, password };
      } else {
        payload = { email, password };
      }

      const res = await resetPassword(payload);
      setSuccess(res.data?.message || "Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; code?: string } };
        message?: string;
      };
      setError(axiosError.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <AnimatedBackground theme={theme}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className={theme === "light" ? "text-gray-600" : "text-white/70"}>Verifying...</p>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

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
                {mode === "password" ? "Set New Password" : "Reset Password"}
              </h1>
              <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
                {mode === "otp" && "Enter the OTP code from your email to continue."}
                {mode === "password" && "Create a new password for your account."}
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

            {!verified && !token && (
              <form className="space-y-5" onSubmit={handleVerifyOTP}>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400" : "text-white/30"}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className={`w-full h-11 pl-10 pr-4 rounded-lg border text-sm outline-none transition ${
                        theme === "light"
                          ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50"
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                    OTP Code
                  </label>
                  <div className="relative">
                    <Key size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400" : "text-white/30"}`} />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className={`w-full h-11 pl-10 pr-4 rounded-lg border text-sm outline-none transition tracking-widest font-mono ${
                        theme === "light"
                          ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50"
                      }`}
                      required
                      maxLength={6}
                    />
                  </div>
                  <p className={`mt-1 text-xs ${theme === "light" ? "text-slate-500" : "text-white/40"}`}>
                    Check your email for the 6-digit code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className={`w-full h-11 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-xl ${
                    theme === "light"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                      : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {verified || token ? (
              <form className="space-y-5" onSubmit={handleResetPassword}>
                {email && (
                  <div className={`p-3 rounded-lg text-sm ${theme === "light" ? "bg-blue-50 text-blue-700" : "bg-indigo-500/20 text-indigo-300"}`}>
                    Resetting password for: <strong>{email}</strong>
                  </div>
                )}

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
            ) : null}

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
