import React, { useState } from "react";
import { Palette, Monitor, Moon, Sun } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { useTheme } from "../../../contexts/useTheme";

const AppearanceSettingsCard: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [localTheme, setLocalTheme] = useState<"light" | "dark" | "system">(theme);

  const themes = [
    { id: "light" as const, label: "Sáng", icon: Sun, desc: "Nền trắng, chữ tối" },
    { id: "dark" as const, label: "Tối", icon: Moon, desc: "Nền tối, chữ sáng" },
    { id: "system" as const, label: "Hệ thống", icon: Monitor, desc: "Theo cài đặt thiết bị" },
  ];

  const handleSelect = (id: "light" | "dark" | "system") => {
    setLocalTheme(id);
    if (id === "light" || id === "dark") {
      setTheme(id);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  };

  return (
    <SettingsSection
      title="Giao diện"
      description="Tùy chỉnh giao diện ứng dụng"
      icon={<Palette size={18} />}
      color="purple"
    >
      <div className="space-y-3">
        {themes.map((t) => {
          const isActive = localTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                isActive
                  ? "border-purple-500" + (isDark ? " bg-purple-500/20" : " bg-purple-50")
                  : (isDark ? " border-white/10 bg-slate-800 hover:border-purple-500/40" : " border-slate-200 bg-white hover:border-purple-300")
              }`}
            >
              <div className={`p-2.5 rounded-lg ${
                isActive
                  ? (isDark ? " bg-purple-500/30" : " bg-purple-100")
                  : (isDark ? " bg-slate-700" : " bg-slate-100")
              }`}>
                <t.icon size={20} className={
                  isActive
                    ? (isDark ? " text-purple-300" : " text-purple-600")
                    : (isDark ? " text-gray-300" : " text-slate-600")
                } />
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${
                  isActive
                    ? (isDark ? " text-purple-200" : " text-purple-700")
                    : (isDark ? " text-white" : " text-slate-900")
                }`}>{t.label}</p>
                <p className={`text-xs ${
                  isActive
                    ? (isDark ? " text-purple-300/80" : " text-purple-600/80")
                    : (isDark ? " text-gray-400" : " text-slate-500")
                }`}>{t.desc}</p>
              </div>
              {isActive && (
                <div className={`ml-auto w-5 h-5 rounded-full flex items-center justify-center ${
                  isDark ? " bg-purple-500" : " bg-purple-600"
                }`}>
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
};

export default AppearanceSettingsCard;
