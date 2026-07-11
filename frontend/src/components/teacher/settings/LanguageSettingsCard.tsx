import React, { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import SettingsSection from "./SettingsSection";

const languages = [
  { code: "vi", name: "Tiếng Việt", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
];

const LanguageSettingsCard: React.FC = () => {
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
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl hover:border-teal-300 dark:hover:border-teal-500/40 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{selectedLang?.flag}</span>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedLang?.native}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{selectedLang?.name}</p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-slate-400 dark:text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setCurrentLang(lang.code);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                  currentLang === lang.code
                    ? "bg-teal-50 dark:bg-teal-500/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{lang.native}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">{lang.name}</p>
                </div>
                {currentLang === lang.code && (
                  <Check size={18} className="text-teal-600 dark:text-teal-400" />
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
