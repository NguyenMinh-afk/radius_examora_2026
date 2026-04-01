import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../Footer/Footer";

const Forgot: React.FC = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    // Thực tế: gửi email reset link ở đây
    setShowOtpModal(true); // mở modal
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Xử lý reset password với OTP + newPassword ở đây
    alert("Password reset successfully!");
    setShowOtpModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-slate-100 to-teal-100">

      {/* HEADER */}
      <div className="text-center mt-6 mb-6">
        <Link to="/">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 cursor-pointer hover:text-blue-800 transition">
            EXMORA
          </h1>
        </Link>
      </div>

      {/* CENTER */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-black mb-2">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter your email address and we’ll send you a link to reset your password.
          </p>

          {/* FORM */}
          <form className="space-y-3" onSubmit={handleSendResetLink}>
            <div>
              <label className="text-xs font-semibold text-gray-500">Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg text-sm shadow hover:scale-[1.02] transition"
            >
              Send Reset Link
            </button>
          </form>

          {/* BACK TO LOGIN */}
          <div className="text-center text-xs mt-4">
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />

      {/* MODAL OTP + Reset Password */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-bold text-black mb-3">Reset Your Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter the OTP sent to your email and set a new password.
            </p>

            <form className="space-y-3" onSubmit={handleResetPassword}>
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

              <div>
                <label className="text-xs font-semibold text-gray-500">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
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
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Forgot;