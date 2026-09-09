import React, { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { useTheme } from "../../../contexts/useTheme";

const languages = [
  { code: "vi", name: "Tiếng Việt", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
];

const LanguageSettingsCard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentLang, setCurrentLang] = useState("vi");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLang = languages.find((l) => l.code === currentLang);

  return (
    <SettingsSection
      title="Ngôn ngữ"
      description="Chọn ngôn ngữ hiển thị"
      icon={<Globe size={18} />}
      color="teal"
    >
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl hover:border-teal-300 transition ${
            isDark
              ? "bg-slate-800 border-white/10 hover:border-teal-500/40"
              : "bg-white border-slate-200 hover:border-teal-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{selectedLang?.flag}</span>
            <div className="text-left">
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{selectedLang?.native}</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>{selectedLang?.name}</p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`${isDark ? "text-gray-500" : "text-slate-400"} transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <div className={`absolute z-10 w-full mt-2 border rounded-xl shadow-lg overflow-hidden ${
            isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
          }`}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setCurrentLang(lang.code);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                  currentLang === lang.code
                    ? isDark ? "bg-teal-500/20" : "bg-teal-50"
                    : isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{lang.native}</p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>{lang.name}</p>
                </div>
                {currentLang === lang.code && (
                  <Check size={18} className={isDark ? "text-teal-400" : "text-teal-600"} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </SettingsSection>
  );
};

export default LanguageSettingsCard;
