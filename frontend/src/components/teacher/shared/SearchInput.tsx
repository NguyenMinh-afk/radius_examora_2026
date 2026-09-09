import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
  isDark?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  onSearch,
  isDark,
}) => {
  return (
    <div className="relative">
      <Search
        size={18}
        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
          isDark ? "text-gray-500" : "text-slate-400"
        }`}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition ${
          isDark
            ? "bg-slate-800 border-white/10 text-white placeholder:text-gray-500"
            : "bg-white border-slate-200"
        }`}
      />
    </div>
  );
};

export default SearchInput;
