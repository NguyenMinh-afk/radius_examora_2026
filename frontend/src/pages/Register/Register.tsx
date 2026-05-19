import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff, GraduationCap, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import { getGoogleLoginUrl, registerUser } from "../../api/axios/User";
import { getDashboardPath, saveAuthData } from "../../utils/auth";

type RegisterRole = "student" | "teacher";

const roles: { id: RegisterRole; label: string; icon: React.ReactNode }[] = [
  { id: "student", label: "Student", icon: <GraduationCap size={18} /> },
  { id: "teacher", label: "Teacher", icon: <User size={18} /> },
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
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!agreed) {
      setError("Please accept the terms before continuing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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

      const responseRole = saveAuthData(res.data);
      if (responseRole) {
        navigate(getDashboardPath(responseRole));
        return;
      }

      if (res.data.user?.approval_status === "pending") {
        setInfo("Registration submitted. Please wait for admin approval before signing in.");
      } else {
        setInfo(res.data.message || "Registration completed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleLoginUrl();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-slate-100 to-teal-100 overflow-x-hidden">
      <div className="text-center mt-6 mb-6">
        <Link to="/">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 cursor-pointer hover:text-blue-800 transition">
            EXMORA
          </h1>
        </Link>
        <p className="text-gray-500 text-xs mt-1">
          Join the future of intelligent examination systems
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create your account</h2>

          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {info}
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 mb-2">Select your role</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {roles.map((item) => {
              const isActive = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`border rounded-lg p-2 flex flex-col items-center gap-1 transition ${
                    isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                      isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-xs font-medium transition ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <form className="space-y-3" onSubmit={handleRegister}>
            <div>
              <label className="text-xs font-semibold text-gray-500">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu"
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    tabIndex={-1}
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">CONFIRM</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <label htmlFor="agree" className="text-xs text-gray-500">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreed || isSubmitting}
              className={`w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm shadow transition ${
                !agreed || isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? "Creating account..." : "Complete Registration"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center text-xs mt-3 text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign In
            </Link>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="border rounded-lg py-2 flex items-center justify-center gap-2 text-xs hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" />
              Google
            </button>
            <button
              type="button"
              className="border rounded-lg py-2 flex items-center justify-center gap-2 text-xs hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-4 h-4" />
              Facebook
            </button>
            <button
              type="button"
              className="border rounded-lg py-2 flex items-center justify-center gap-2 text-xs hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/475654/github-color.svg" className="w-4 h-4" />
              GitHub
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
