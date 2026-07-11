import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

const paddingSizes = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  title,
  subtitle,
  icon,
  actions,
}) => {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${paddingSizes[padding]} ${className}`}>
      {(title || icon || actions) && (
        <div className={`flex flex-wrap gap-2 ${padding === "none" || padding === "sm" ? "mb-3" : "mb-5"} ${padding === "none" || padding === "sm" ? "pb-3 border-b border-slate-100" : ""}`}>
          <div className="flex-1">
            {(title || icon) && (
              <div className="flex items-center gap-2">
                {icon && <span className="text-blue-600">{icon}</span>}
                {title && <h3 className="font-bold text-slate-950">{title}</h3>}
              </div>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export const CardGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-1 gap-5 ${className}`}>
      {children}
    </div>
  );
};

export const CardGridTwoCol: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
