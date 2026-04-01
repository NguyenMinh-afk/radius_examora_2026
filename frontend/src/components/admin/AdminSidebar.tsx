import React from "react";
import { LayoutGrid, Users, MessageSquare, Cpu, BookOpen, Sparkles, GraduationCap, FileText, Settings, LogOut, ArrowUpRight } from "lucide-react";

const menu = [
  { label: "System", icon: <LayoutGrid size={18} />, active: true },
  { label: "Users", icon: <Users size={18} /> },
  { label: "RabbitMQ", icon: <MessageSquare size={18} /> },
  { label: "AI Models", icon: <Cpu size={18} /> },
  { label: "Question Bank", icon: <BookOpen size={18} /> },
  { label: "AI Generator", icon: <Sparkles size={18} /> },
  { label: "Classes", icon: <GraduationCap size={18} /> },
  { label: "Exams", icon: <FileText size={18} /> },
];

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col px-6 py-8">
      
      {/* Logo */}
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight">
          EXMORA
        </h2>
        <span className="text-xs text-gray-400 font-medium">
          Admin Panel
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {menu.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition
              ${
                item.active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-8">
        <button className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-semibold rounded-lg py-2 mb-6 hover:bg-blue-200 transition">
          <ArrowUpRight size={16} />
          Upgrade to Pro
        </button>

        <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium hover:bg-slate-50 hover:text-blue-700 transition"
          >
            <Settings size={18} />
            Settings
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium hover:bg-slate-50 hover:text-blue-700 transition"
          >
            <LogOut size={18} />
            Logout
          </a>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;