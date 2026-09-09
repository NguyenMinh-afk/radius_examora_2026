import React, { useState } from "react";
import { X, Plus, Trash2, Upload, AlertCircle, Check, Download } from "lucide-react";
import { createQuestion, type CreateQuestionPayload } from "../../../api/questionApi";

interface QuestionFormData {
  content: string;
  questionType: string;
  difficulty: string;
  points: number;
  answers: { content: string; isCorrect: boolean }[];
}

interface BulkCreateQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyQuestion = (): QuestionFormData => ({
  content: "",
  questionType: "multiple_choice",
  difficulty: "medium",
  points: 1,
  answers: [
    { content: "", isCorrect: true },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ],
});

const BulkCreateQuestionsModal: React.FC<BulkCreateQuestionsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [questions, setQuestions] = useState<QuestionFormData[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [importMode, setImportMode] = useState<"manual" | "file">("manual");
  const [fileData, setFileData] = useState<string[][] | null>(null);
  const [importing, setImporting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, patch: Partial<QuestionFormData>) => {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateAnswer = (qIndex: number, aIndex: number, patch: Partial<typeof questions[0]["answers"][0]>) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers[aIndex] = { ...newQuestions[qIndex].answers[aIndex], ...patch };
    setQuestions(newQuestions);
  };

  const addAnswer = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers.push({ content: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    if (questions[qIndex].answers.length > 2) {
      const newQuestions = [...questions];
      newQuestions[qIndex].answers.splice(aIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const setCorrectAnswer = (qIndex: number, aIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers = newQuestions[qIndex].answers.map((a, i) => ({
      ...a,
      isCorrect: i === aIndex,
    }));
    setQuestions(newQuestions);
  };

  const validateQuestions = (): string[] => {
    const errs: string[] = [];
    questions.forEach((q, i) => {
      if (!q.content.trim()) {
        errs.push(`Câu ${i + 1}: Vui lòng nhập nội dung câu hỏi`);
      }
      const validAnswers = q.answers.filter((a) => a.content.trim());
      if (validAnswers.length < 2) {
        errs.push(`Câu ${i + 1}: Cần ít nhất 2 đáp án`);
      }
      if (!q.answers.some((a) => a.isCorrect && a.content.trim())) {
        errs.push(`Câu ${i + 1}: Cần chọn ít nhất 1 đáp án đúng`);
      }
    });
    return errs;
  };

  const handleSaveAll = async () => {
    const validationErrors = validateQuestions();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors([]);
    let count = 0;

    try {
      for (const q of questions) {
        const validAnswers = q.answers.filter((a) => a.content.trim());
        const payload: CreateQuestionPayload = {
          content: q.content.trim(),
          questionType: q.questionType,
          difficulty: q.difficulty,
          points: q.points,
          answers: validAnswers,
          tagIds: [],
        };
        await createQuestion(payload);
        count++;
      }
      setSuccessCount(count);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setErrors([`Lỗi khi lưu: ${(err as Error).message}`]);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      const parsed: string[][] = [];

      // Parse CSV-like format: content|questionType|difficulty|answer1|answer2|answer3|answer4|correctIndex
      for (const line of lines) {
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length >= 4) {
          parsed.push(parts);
        }
      }

      if (parsed.length === 0) {
        setErrors(["File không đúng định dạng. Định dạng: nội dung|câu_hỏi|độ_khó|đáp án 1|đáp án 2|đáp án 3|đáp án 4|chỉ_số_đúng"]);
        setFileData(null);
      } else {
        setFileData(parsed);
        setErrors([]);
        // Convert to form data
        const importedQuestions: QuestionFormData[] = parsed.map((row) => {
          const correctIndex = parseInt(row[7] || "0", 10) - 1;
          const answers = row.slice(3, 7).map((content, idx) => ({
            content,
            isCorrect: idx === correctIndex,
          }));
          return {
            content: row[0],
            questionType: row[1] || "multiple_choice",
            difficulty: row[2] || "medium",
            points: 1,
            answers: answers.filter((a) => a.content),
          };
        });
        setQuestions(importedQuestions);
        setImportMode("manual");
      }
    } catch {
      setErrors(["Không thể đọc file"]);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Nội dung câu hỏi|multiple_choice|medium|Đáp án A|Đáp án B|Đáp án C|Đáp án D|1
Câu hỏi tiếp theo|multiple_choice|easy|True|False||2
Một câu hỏi khác|multiple_choice|hard|Option 1|Option 2|Option 3|Option 4|3`;
    const blob = new Blob([template], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_cau_hoi.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 dark:bg-black/70 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tạo nhiều câu hỏi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {questions.length} câu hỏi - {questions.reduce((sum, q) => sum + q.answers.filter((a) => a.content.trim()).length, 0)} đáp án
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex gap-4">
            <button
              onClick={() => setImportMode("manual")}
              className={`pb-3 text-sm font-medium transition border-b-2 ${
                importMode === "manual"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Nhập thủ công
            </button>
            <button
              onClick={() => setImportMode("file")}
              className={`pb-3 text-sm font-medium transition border-b-2 ${
                importMode === "file"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Nhập từ file
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* File Import Mode */}
          {importMode === "file" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition">
                <Upload size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Tải lên file câu hỏi</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Hỗ trợ .txt (định dạng CSV)</p>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={importing}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer text-sm"
                >
                  {importing ? "Đang xử lý..." : "Chọn file"}
                </label>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Định dạng file:</p>
                <code className="text-xs text-amber-700 dark:text-amber-400 block mb-2">
                  Nội dung|câu_hỏi|độ_khó|đáp án 1|đáp án 2|đáp án 3|đáp án 4|chỉ_số_đúng
                </code>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Download size={14} />
                  Tải file mẫu
                </button>
              </div>

              {fileData && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Đã import {fileData.length} câu hỏi thành công!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Mode */}
          {importMode === "manual" && (
            <div className="space-y-6">
              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 space-y-1">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Success */}
              {successCount > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center gap-2">
                  <Check size={20} className="text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Đã tạo thành công {successCount} câu hỏi!
                  </p>
                </div>
              )}

              {/* Questions */}
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-700/30">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {qIndex + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Câu hỏi</span>
                    </div>
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      disabled={questions.length === 1}
                      className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Question Content */}
                  <textarea
                    value={q.content}
                    onChange={(e) => updateQuestion(qIndex, { content: e.target.value })}
                    placeholder="Nhập nội dung câu hỏi..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-700 dark:text-white"
                  />

                  {/* Meta Row */}
                  <div className="flex gap-3 mt-3">
                    <select
                      value={q.questionType}
                      onChange={(e) => updateQuestion(qIndex, { questionType: e.target.value })}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                    >
                      <option value="multiple_choice">Trắc nghiệm</option>
                      <option value="true_false">Đúng/Sai</option>
                    </select>
                    <select
                      value={q.difficulty}
                      onChange={(e) => updateQuestion(qIndex, { difficulty: e.target.value })}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-600 dark:text-slate-400">Điểm:</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={q.points}
                        onChange={(e) => updateQuestion(qIndex, { points: parseInt(e.target.value, 10) || 1 })}
                        className="w-16 px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Answers */}
                  <div className="mt-4 space-y-2">
                    {q.answers.map((answer, aIndex) => (
                      <div key={aIndex} className="flex items-center gap-2">
                        <button
                          onClick={() => setCorrectAnswer(qIndex, aIndex)}
                          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                            answer.isCorrect
                              ? "bg-green-500 border-green-500"
                              : "border-slate-300 dark:border-slate-500 hover:border-green-400"
                          }`}
                        >
                          {answer.isCorrect && <Check size={14} className="text-white" />}
                        </button>
                        <input
                          type="text"
                          value={answer.content}
                          onChange={(e) => updateAnswer(qIndex, aIndex, { content: e.target.value })}
                          placeholder={`Đáp án ${aIndex + 1}`}
                          className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                        />
                        <button
                          onClick={() => removeAnswer(qIndex, aIndex)}
                          disabled={q.answers.length <= 2}
                          className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addAnswer(qIndex)}
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Plus size={14} />
                    Thêm đáp án
                  </button>
                </div>
              ))}

              {/* Add More */}
              <button
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Thêm câu hỏi
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {questions.length} câu hỏi sẽ được tạo
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving || questions.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? "Đang lưu..." : `Tạo ${questions.length} câu hỏi`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateQuestionsModal;
