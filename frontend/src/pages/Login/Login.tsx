
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../Footer/Footer";
import { loginUser } from "../../api/axios/User";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password, rememberMe });
      // Lưu token vào localStorage nếu rememberMe, ngược lại chỉ alert
      if (rememberMe && res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      alert("Login success! Token: " + res.data.token);
      // TODO: chuyển hướng trang...
    } catch (err: any) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-slate-100 to-teal-100 overflow-x-hidden">

      {/* HEADER */}
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

      {/* CENTER */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-lg">

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign in to your account</h2>

          {/* FORM */}
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

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm shadow hover:scale-[1.02] transition"
            >
              Sign In
              <ArrowRight size={16} />
            </button>
          </form>

          {/* REGISTER */}
          <div className="text-center text-xs mt-4 text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Create Account
            </Link>
          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* SOCIAL LOGIN */}
          <div className="grid grid-cols-3 gap-2">
            <button className="border rounded-lg py-2 flex items-center justify-center gap-2 text-xs hover:bg-gray-50">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" />
              Google
            </button>
            <button className="border rounded-lg py-2 flex items-center justify-center gap-2 text-xs hover:bg-gray-50">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-4 h-4" />
              Facebook
            </button>
            <button className="border rounded-lg py-2 flex items-center justify-center gap-2 text-xs hover:bg-gray-50">
              <img src="https://www.svgrepo.com/show/475654/github-color.svg" className="w-4 h-4" />
              GitHub
            </button>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Login;