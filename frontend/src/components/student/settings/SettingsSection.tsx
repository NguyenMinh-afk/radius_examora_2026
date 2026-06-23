import React from "react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {icon && <span className="text-blue-600">{icon}</span>}
          {title}
        </h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;
