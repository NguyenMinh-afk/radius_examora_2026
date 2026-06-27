import React from "react";
import { Search } from "lucide-react";

interface QuestionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch?: () => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  search,
  onSearchChange,
  onSearch,
  difficulty,
  onDifficultyChange,
}) => {
  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm câu hỏi..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Tất cả độ khó</option>
        <option value="easy">Dễ</option>
        <option value="medium">Trung bình</option>
        <option value="hard">Khó</option>
        <option value="very_hard">Rất khó</option>
      </select>
    </div>
  );
};

export default QuestionFilters;
