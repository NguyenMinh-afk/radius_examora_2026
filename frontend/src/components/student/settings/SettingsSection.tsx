import React from "react";
import { useTheme } from "../../../contexts/useTheme";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  color?: "blue" | "indigo" | "green" | "purple" | "teal" | "red";
}

const colorMapLight = {
  blue: "text-blue-600",
  indigo: "text-indigo-600",
  green: "text-green-600",
  purple: "text-purple-600",
  teal: "text-teal-600",
  red: "text-red-600",
};

const colorMapDark = {
  blue: "text-blue-400",
  indigo: "text-indigo-400",
  green: "text-emerald-400",
  purple: "text-purple-400",
  teal: "text-teal-400",
  red: "text-red-400",
};

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon,
  children,
  color = "blue",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colorClass = isDark ? colorMapDark[color] : colorMapLight[color];

  return (
    <div className={`rounded-xl shadow-sm border mb-6 last:mb-0 ${
      isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
    }`}>
      <div className={`p-5 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
        <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          {icon && <span className={colorClass}>{icon}</span>}
          {title}
        </h3>
        {description && <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;