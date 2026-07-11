import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isDark?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className = "",
  isDark,
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none border ${
          isDark
            ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500"
            : "bg-white border-slate-200 text-gray-900 placeholder:text-gray-400"
        }`}
      />
    </div>
  );
};

export default SearchInput;