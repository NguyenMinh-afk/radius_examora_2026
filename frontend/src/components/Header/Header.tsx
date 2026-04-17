import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Platform", href: "#platform" },
  { label: "AI Engine", href: "#ai-engine" },
  { label: "Contact", href: "/contact" },
];

const Header: React.FC = () => (
  <header className="relative z-10 flex justify-between items-center px-10 py-4 bg-white/70 backdrop-blur border-b">
    
    {/* Logo */}
    <Link to="/" className="flex items-center gap-2 relative">
      <motion.div
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 flex items-center justify-center shadow-lg relative"
        whileHover={{ scale: 1.15, rotate: 15 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Kim cương trắng */}
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: "white",
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            position: "absolute", // đặt absolute
          }}
        />
      </motion.div>
      <span className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition">
        EXMORA
      </span>
    </Link>

    {/* Navigation */}
    <nav className="flex gap-8 text-gray-600 font-medium">
      {navItems.map((item) => (
        <a key={item.label} href={item.href} className="hover:text-blue-600">
          {item.label}
        </a>
      ))}
    </nav>

    {/* Actions */}
    <div className="flex gap-3">
      <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2">
        Login
      </Link>
      <Link
        to="/register"
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        SignUp
      </Link>
    </div>
  </header>
);

export default Header;