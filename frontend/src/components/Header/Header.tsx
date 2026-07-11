import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/auth";
import { User, Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/useTheme";

/**
 * =============================================
 * STICKY HEADER - EXMORA
 * =============================================
 * Tính năng: Giữ thanh menu (header) cố định ở đầu trang khi người dùng cuộn chuột xuống.
 *
 * UX Benefits:
 * - Người dùng có thể điều hướng đến các trang khác mà không cần cuộn lên đầu trang
 * - Cực kỳ hữu ích cho website có nội dung dài
 *
 * Cơ chế hoạt động:
 * 1. isScrolled = false (ở đầu trang) → Header trong suốt, không shadow
 * 2. isScrolled = true (scroll > 20px) → Header cố định với backdrop-blur + shadow nhẹ
 * =============================================
 */

const navItems = [
  { label: "Home", href: "/", type: "link" },
  { label: "Features", href: "/#features", type: "link" },
  { label: "How It Works", href: "/#how-it-works", type: "link" },
  { label: "About", href: "/about", type: "link" },
  { label: "Contact", href: "/contact", type: "link" },
];

const Header: React.FC = () => {
  // State để theo dõi trạng thái scroll
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Event listener để detect scroll
  useEffect(() => {
    const handleScroll = () => {
      // Khi scroll > 20px → active sticky mode
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClickOutside = () => setIsUserMenuOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9999] flex justify-between items-center px-6 lg:px-10 py-3 transition-all duration-300 ${
        isScrolled
          ? isDark
            ? "bg-slate-900/95 backdrop-blur-lg shadow-md border-b border-white/10"
            : "bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-100"
          : isDark
            ? "bg-slate-900/80 backdrop-blur-md border-b border-transparent"
            : "bg-white/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 relative">
        <motion.div
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 flex items-center justify-center shadow-lg relative"
          whileHover={{ scale: 1.15, rotate: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              backgroundColor: "white",
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              position: "absolute",
            }}
          />
        </motion.div>
        <span className={`text-xl font-bold hover:text-blue-600 transition ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          EXMORA
        </span>
      </Link>

      {/* Navigation */}
      <nav className={`hidden md:flex gap-6 lg:gap-8 text-sm font-medium ${
        isDark ? "text-gray-400" : "text-gray-600"
      }`}>
        {navItems.map((item) => (
          <a key={item.label} href={item.href} className={`hover:text-blue-600 transition-colors ${
            isDark ? "hover:text-indigo-400" : ""
          }`}>
            {item.label}
          </a>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex gap-2 items-center">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
            isDark
              ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
          }`}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsUserMenuOpen((prev) => !prev);
              }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name || user.email} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-white leading-none">
                    {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg py-2 z-50 ${
                isDark ? "bg-slate-800 border border-white/10" : "bg-white border-slate-200"
              }`}>
                <div className={`px-3 py-2 border-b mb-1 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{user.full_name || user.email}</p>
                  {user.email && <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-500"}`}>{user.email}</p>}
                </div>
                <Link
                  to={getDashboardPath(user.role)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                    isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-700"
                  }`}
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User size={16} />
                  Trang của tôi
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 w-full ${
                    isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-600"
                  }`}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isDark ? "text-gray-400 hover:text-indigo-400" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              SignUp
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className={`md:hidden p-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
};

export default Header;
