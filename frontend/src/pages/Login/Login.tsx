import React, { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import { getGoogleLoginUrl, loginUser } from "../../api/axios/User";
import { getDashboardPath, saveAuthData } from "../../utils/auth";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // Xử lý thông báo từ OAuth redirect
    const oauthError = searchParams.get("error");
    const oauthMessage = searchParams.get("message");
    if (oauthError) {
      setError(oauthMessage || `OAuth error: ${oauthError}`);
      window.history.replaceState(null, "", "/login");
      return;
    }

    // Xử lý đăng ký thành công
    const registered = searchParams.get("registered");
    const message = searchParams.get("message");
    if (!registered && !message) return;

    setInfo(message || "Registration successful. Please sign in to continue.");
    window.history.replaceState(null, "", "/login");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await loginUser({ email, password, rememberMe });
      const role = saveAuthData(res.data);
      navigate(getDashboardPath(role));
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
        <p className="text-2xl font-bold text-black mt-4">
          Welcome back to EXMORA.
        </p>
        <p className="text-lg text-black mt-1">
          Sign in to access your curated intellectual journey.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Sign in to your account
          </h2>

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

          <form className="space-y-3" onSubmit={handleLogin}>
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
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-blue-600"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm shadow transition ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center text-xs mt-4 text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Create Account
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

export default Login;