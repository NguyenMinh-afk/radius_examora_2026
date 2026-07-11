import React, { useState } from "react";
import { Palette, Monitor, Moon, Sun } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { useTheme } from "../../../contexts/useTheme";

const AppearanceSettingsCard: React.FC = () => {
  const { theme, setTheme } = useTheme();
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
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-500/20"
                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-500/40"
              }`}
            >
              <div className={`p-2.5 rounded-lg ${
                isActive
                  ? "bg-purple-100 dark:bg-purple-500/30"
                  : "bg-slate-100 dark:bg-slate-700"
              }`}>
                <t.icon size={20} className={
                  isActive
                    ? "text-purple-600 dark:text-purple-300"
                    : "text-slate-600 dark:text-gray-300"
                } />
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${isActive ? "text-purple-700 dark:text-purple-200" : "text-slate-900 dark:text-white"}`}>{t.label}</p>
                <p className={`text-xs ${isActive ? "text-purple-600/80 dark:text-purple-300/80" : "text-slate-500 dark:text-gray-400"}`}>{t.desc}</p>
              </div>
              {isActive && (
                <div className="ml-auto w-5 h-5 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
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
