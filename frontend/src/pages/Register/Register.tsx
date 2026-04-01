import React, { useState } from "react";
import { GraduationCap, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../Footer/Footer";

const roles = [
  { id: "student", label: "Student", icon: <GraduationCap size={18} /> },
  { id: "teacher", label: "Teacher", icon: <User size={18} /> },
];

const Register: React.FC = () => {
  const [role, setRole] = useState("student");
  const [agreed, setAgreed] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return; // không cho submit nếu chưa tick
    setShowOtpModal(true); // mở modal OTP
  };

  const handleConfirmOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Thực tế: kiểm tra OTP và xác thực tài khoản
    alert("Account verified successfully!");
    setShowOtpModal(false);
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
        <p className="text-gray-500 text-xs mt-1">
          Join the future of intelligent examination systems
        </p>
      </div>

      {/* CENTER CONTENT */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-lg">

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create your account</h2>

          {/* ROLE SELECTION */}
          <p className="text-xs font-semibold text-gray-500 mb-2">Select your role</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {roles.map((r) => {
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`border rounded-lg p-2 flex flex-col items-center gap-1 transition
                    ${isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400"}`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full transition
                    ${isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                  >
                    {r.icon}
                  </div>
                  <span className={`text-xs font-medium transition
                    ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* FORM */}
          <form className="space-y-3" onSubmit={handleRegister}>
            <div>
              <label className="text-xs font-semibold text-gray-500">FULL NAME</label>
              <input
                type="text"
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
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">CONFIRM</label>
                <input
                  type="password"
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* AGREEMENT */}
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

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={!agreed}
              className={`w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm shadow transition
                ${!agreed ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}
            >
              Complete Registration
              <ArrowRight size={16} />
            </button>
          </form>

          {/* LOGIN */}
          <div className="text-center text-xs mt-3 text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign In
            </Link>
          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* SOCIAL SIGNUP */}
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

      {/* OTP / CAPTCHA MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-bold text-black mb-3">Verify Your Account</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter the OTP sent to your email to complete registration.
            </p>

            <form className="space-y-3" onSubmit={handleConfirmOtp}>
              <div>
                <label className="text-xs font-semibold text-gray-500">OTP / CAPTCHA</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Register;