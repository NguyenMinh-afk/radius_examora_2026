import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, Sun, Moon, AlertTriangle } from "lucide-react";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import { useTheme } from "../../contexts/useTheme";
import { requestPasswordReset } from "../../api/axios/User";

const Forgot: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResetUrl("");
    setIsSubmitting(true);

    try {
      const res = await requestPasswordReset({ email });
      const data = res.data;

      if (data?.code === "OAUTH_ONLY_RESET") {
        setError("This account uses Google Sign-In. Please sign in with Google or set a password first.");
        return;
      }

      setSuccess("If an account exists, a password reset link has been sent.");
      setEmail("");
      setResetUrl(data?.resetUrl || "");
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const serverMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to request password reset.";
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
                Forgot Password
              </h1>
              <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
                Enter your email and we'll send you a reset link.
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
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                }`}
              >
                {success}
              </div>
            )}

            {resetUrl && (
              <div className="mb-4 rounded-lg border px-4 py-3 text-sm break-all">
                <a
                  href={resetUrl}
                  className={`underline ${theme === "light" ? "text-blue-700" : "text-blue-300"}`}
                >
                  Open reset password link
                </a>
                <div className={`mt-1 text-xs ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
                  {resetUrl}
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
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
                    placeholder="name@institution.edu"
                    className={`w-full h-11 pl-10 pr-4 rounded-lg border text-sm outline-none transition ${
                      theme === "light"
                        ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50 focus:bg-white/10"
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                </div>
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>

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
    </AnimatedBackground>
  );
};

export default Forgot;
