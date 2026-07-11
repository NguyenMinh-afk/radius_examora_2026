import React from "react";
import { type Theme } from "../../contexts/theme";

interface PasswordStrengthMeterProps {
  password: string;
  theme?: Theme;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password, theme = "light" }) => {
  const isDark = theme === "dark";

  const getStrength = (pwd: string): { score: number; label: string; color: string; textColor: string } => {
    if (!pwd) return { score: 0, label: "", color: "", textColor: "" };

    let score = 0;

    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500", textColor: isDark ? "text-rose-400" : "text-rose-600" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500", textColor: isDark ? "text-amber-400" : "text-amber-600" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500", textColor: isDark ? "text-blue-400" : "text-blue-600" };
    if (score >= 4) return { score: 4, label: "Strong", color: "bg-emerald-500", textColor: isDark ? "text-emerald-400" : "text-emerald-600" };

    return { score: 0, label: "", color: "", textColor: "" };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength.score ? strength.color : isDark ? "bg-white/10" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength.textColor}`}>
        {strength.label}
      </p>
    </div>
  );
};

export default PasswordStrengthMeter;
