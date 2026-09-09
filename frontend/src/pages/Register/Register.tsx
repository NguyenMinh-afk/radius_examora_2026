import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import PasswordStrengthMeter from "../../components/shared/PasswordStrengthMeter";
import { getGoogleLoginUrl, registerUser } from "../../api/axios/User";
import { useTheme } from "../../contexts/useTheme";

type RegisterRole = "student" | "teacher";

const roles: { id: RegisterRole; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "student",
    label: "Student",
    icon: <GraduationCap size={20} />,
    description: "Take exams and track progress",
  },
  {
    id: "teacher",
    label: "Teacher",
    icon: <BookOpen size={20} />,
    description: "Create exams and manage students",
  },
];

const Register: React.FC = () => {
  const [role, setRole] = useState<RegisterRole>("student");
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const oauthError = searchParams.get("error");
    const oauthMessage = searchParams.get("message");
    if (oauthError) {
      setError(oauthMessage || `OAuth error: ${oauthError}`);
      window.history.replaceState(null, "", "/register");
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Please accept the terms before continuing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerUser({
        email,
        password,
        full_name: fullName,
        role,
      });

      const isPending = res.data.user?.approval_status === "pending";
      const message = isPending
        ? "Registration submitted. Please wait for admin approval before signing in."
        : "Registration successful. Please sign in to continue.";

      navigate(`/login?registered=1&message=${encodeURIComponent(message)}`);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      setError(axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleLoginUrl();
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: "white",
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  }}
                />
              </div>
              <span className={`text-2xl font-bold tracking-tight ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                EXAMORA
              </span>
            </Link>
            <p className={`mt-4 text-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
              AI Powered Examination Platform
            </p>
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
                Create your account
              </h1>
              <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
                Join thousands of educators and students
              </p>
            </div>

            {/* Error */}
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

            {/* Role Selection */}
            <div className="mb-6">
              <label className={`block text-xs font-medium mb-3 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                Select your role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((item) => {
                  const isActive = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id)}
                      className={`relative rounded-xl p-4 border text-left transition-all duration-200 ${
                        isActive
                          ? theme === "light"
                            ? "border-blue-500 bg-blue-50"
                            : "border-indigo-500/50 bg-indigo-500/10"
                          : theme === "light"
                            ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                          isActive
                            ? theme === "light"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-indigo-500/20 text-indigo-400"
                            : theme === "light"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-white/10 text-white/50"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <p className={`text-sm font-medium ${
                        isActive
                          ? theme === "light" ? "text-blue-700" : "text-white"
                          : theme === "light" ? "text-slate-700" : "text-white/70"
                      }`}>
                        {item.label}
                      </p>
                      <p className={`mt-0.5 text-xs line-clamp-1 ${
                        theme === "light" ? "text-slate-500" : "text-white/40"
                      }`}>
                        {item.description}
                      </p>
                      {isActive && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle size={16} className={theme === "light" ? "text-blue-500" : "text-indigo-400"} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400" : "text-white/30"}`} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
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

              {/* Email */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                  Email
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

              {/* Password & Confirm Password - Same Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${theme === "light" ? "text-slate-700" : "text-white/70"}`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-slate-400" : "text-white/30"}`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full h-11 pl-10 pr-10 rounded-lg border text-sm outline-none transition ${
                        theme === "light"
                          ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50 focus:bg-white/10"
                      }`}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
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
                      className={`w-full h-11 pl-10 pr-10 rounded-lg border text-sm outline-none transition ${
                        theme === "light"
                          ? "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          : "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50 focus:bg-white/10"
                      }`}
                      placeholder="Confirm your password"
                      required
                      minLength={8}
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
              </div>
              <PasswordStrengthMeter password={password} theme={theme} />

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-1">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="sr-only peer"
                    disabled={isSubmitting}
                  />
                  <div
                    className={`w-4.5 h-4.5 rounded border cursor-pointer transition peer-disabled:opacity-50 ${
                      theme === "light"
                        ? "border-slate-300 bg-white peer-checked:bg-blue-500 peer-checked:border-blue-500"
                        : "border-white/20 bg-white/5 peer-checked:bg-indigo-500 peer-checked:border-indigo-500"
                    }`}
                    onClick={() => !isSubmitting && setAgreed(!agreed)}
                  />
                  <svg
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition pointer-events-none`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <label
                  htmlFor="agree"
                  className={`text-xs cursor-pointer select-none ${
                    theme === "light" ? "text-slate-500" : "text-white/50"
                  }`}
                >
                  I agree to the{" "}
                  <Link to="/terms" className={`${theme === "light" ? "text-blue-600 hover:text-blue-700" : "text-indigo-400 hover:text-indigo-300"} transition`}>
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className={`${theme === "light" ? "text-blue-600 hover:text-blue-700" : "text-indigo-400 hover:text-indigo-300"} transition`}>
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!agreed || isSubmitting || !!(confirmPassword && password !== confirmPassword)}
                className={`w-full h-11 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-xl mt-2 ${
                  theme === "light"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className={`flex-1 h-px ${theme === "light" ? "bg-slate-200" : "bg-white/10"}`} />
              <span className={`text-xs ${theme === "light" ? "text-slate-400" : "text-white/30"}`}>
                or continue with
              </span>
              <div className={`flex-1 h-px ${theme === "light" ? "bg-slate-200" : "bg-white/10"}`} />
            </div>

            {/* Social */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className={`w-11 h-11 rounded-lg transition flex items-center justify-center ${
                  theme === "light"
                    ? "bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                    : "bg-white hover:bg-gray-100"
                }`}
                title="Continue with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
              <button
                type="button"
                disabled
                className={`w-11 h-11 rounded-lg flex items-center justify-center relative group transition ${
                  theme === "light"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-[#1877F2] hover:bg-[#166fe5]"
                }`}
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none bg-slate-800 text-white`}>
                  Coming Soon
                </span>
              </button>
              <button
                type="button"
                disabled
                className={`w-11 h-11 rounded-lg flex items-center justify-center relative group transition ${
                  theme === "light"
                    ? "bg-slate-800 hover:bg-slate-700"
                    : "bg-[#24292e] hover:bg-[#1b1f23]"
                }`}
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none bg-slate-800 text-white`}>
                  Coming Soon
                </span>
              </button>
            </div>

            {/* Login link */}
            <p className={`mt-6 text-center text-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
              Already have an account?{" "}
              <Link
                to="/login"
                className={`font-medium transition ${
                  theme === "light" ? "text-blue-600 hover:text-blue-700" : "text-indigo-400 hover:text-indigo-300"
                }`}
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className={`mt-6 text-center text-xs ${theme === "light" ? "text-slate-400" : "text-white/30"}`}>
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Register;
