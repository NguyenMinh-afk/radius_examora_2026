import React, { useState } from "react";
import { HelpCircle, Mail, Phone, Book, MessageCircle, ChevronDown, ExternalLink, Search } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useTheme } from "../../contexts/useTheme";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FaqItem[] = [
  {
    id: "1",
    question: "Làm sao để bắt đầu một bài thi?",
    answer: "Để bắt đầu bài thi, bạn vào mục Assignments trong sidebar, chọn bài thi cần làm và nhấn nút 'Bắt đầu thi'. Hệ thống sẽ hướng dẫn bạn qua các bước trước khi bắt đầu.",
    category: "Thi cử"
  },
  {
    id: "2",
    question: "Tôi có thể làm lại bài thi không?",
    answer: "Điều này phụ thuộc vào cài đặt của giáo viên. Một số bài thi cho phép làm lại nhiều lần, một số chỉ cho phép một lần duy nhất. Kiểm tra thông tin bài thi để biết chính xác.",
    category: "Thi cử"
  },
  {
    id: "3",
    question: "Điểm số của tôi được tính như thế nào?",
    answer: "Điểm số được tính dựa trên số câu trả lời đúng trên tổng số câu hỏi. Bạn có thể xem chi tiết điểm số trong mục Results.",
    category: "Kết quả"
  },
  {
    id: "4",
    question: "Tôi quên mật khẩu, phải làm sao?",
    answer: "Nhấn vào 'Quên mật khẩu' ở trang đăng nhập, nhập email đã đăng ký và làm theo hướng dẫn trong email để đặt lại mật khẩu mới.",
    category: "Tài khoản"
  },
  {
    id: "5",
    question: "Làm sao để liên hệ với giáo viên?",
    answer: "Bạn có thể liên hệ giáo viên qua mục Notifications để gửi tin nhắn trực tiếp, hoặc sử dụng thông tin liên hệ được cung cấp trong trang này.",
    category: "Hỗ trợ"
  },
  {
    id: "6",
    question: "Hệ thống có hỗ trợ thi trên điện thoại không?",
    answer: "EXMORA được thiết kế responsive, bạn có thể truy cập và làm bài thi trên cả máy tính và điện thoại. Tuy nhiên, để có trải nghiệm tốt nhất, nên sử dụng máy tính.",
    category: "Kỹ thuật"
  },
  {
    id: "7",
    question: "Tôi gặp lỗi khi nộp bài thi",
    answer: "Đảm bảo kết nối internet ổn định và thử tải lại trang. Nếu vấn đề vẫn tiếp tục, hãy liên hệ bộ phận hỗ trợ qua email hoặc điện thoại được cung cấp.",
    category: "Kỹ thuật"
  },
  {
    id: "8",
    question: "Làm sao để xem lại bài thi đã làm?",
    answer: "Vào mục Results, chọn bài thi bạn muốn xem lại. Bạn có thể xem lại các câu hỏi, đáp án của mình và đáp án đúng.",
    category: "Kết quả"
  }
];

const categories = ["Tất cả", "Thi cử", "Kết quả", "Tài khoản", "Hỗ trợ", "Kỹ thuật"];

const HelpCenter: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaq = faqData.filter((item) => {
    const matchesCategory = selectedCategory === "Tất cả" || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-white via-blue-50 to-indigo-50"}`}>
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 ${isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"} px-4 py-2 rounded-full text-sm font-medium mb-6`}>
              <HelpCircle size={16} />
              Trung tâm hỗ trợ
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>
              Chúng tôi có thể <span className="text-blue-600">giúp gì</span> cho bạn?
            </h1>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"} max-w-2xl mx-auto`}>
              Tìm câu trả lời cho các câu hỏi thường gặp hoặc liên hệ với chúng tôi để được hỗ trợ.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Left Column - Search & Categories & Contact */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${isDark ? "bg-slate-700 border-white/10 text-gray-200 placeholder-gray-500" : "bg-white border-gray-200"} border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {/* Categories */}
              <div className={`${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-5`}>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-3`}>Danh mục</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category
                          ? isDark
                            ? "bg-blue-500/20 text-blue-300 font-medium"
                            : "bg-blue-50 text-blue-700 font-medium"
                          : isDark
                            ? "text-gray-400 hover:bg-slate-700"
                            : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle size={18} />
                  Liên hệ hỗ trợ
                </h3>
                <div className="space-y-3">
                  <a
                    href="mailto:support@exmora.ai"
                    className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
                  >
                    <Mail size={16} />
                    <span className="text-sm">support@exmora.ai</span>
                  </a>
                  <a
                    href="tel:+84123456789"
                    className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
                  >
                    <Phone size={16} />
                    <span className="text-sm">+84 123 456 789</span>
                  </a>
                </div>
                <p className="mt-4 text-xs text-white/70">
                  Thứ 2 - Thứ 6, 8:00 - 18:00
                </p>
              </div>

              {/* Quick Links */}
              <div className={`${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-5`}>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-3 flex items-center gap-2`}>
                  <Book size={18} />
                  Liên kết nhanh
                </h3>
                <div className="space-y-2">
                  <a href="/terms" className={`flex items-center justify-between px-3 py-2 text-sm ${isDark ? "text-gray-400 hover:bg-slate-700" : "text-gray-600 hover:bg-gray-50"} rounded-lg transition-colors`}>
                    Điều khoản sử dụng
                    <ExternalLink size={14} className="text-gray-400" />
                  </a>
                  <a href="/privacy" className={`flex items-center justify-between px-3 py-2 text-sm ${isDark ? "text-gray-400 hover:bg-slate-700" : "text-gray-600 hover:bg-gray-50"} rounded-lg transition-colors`}>
                    Chính sách bảo mật
                    <ExternalLink size={14} className="text-gray-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - FAQ List */}
            <div className="lg:col-span-3">
              <div className={`${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-100"} rounded-2xl shadow-sm border`}>
                <div className={`px-6 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                  <h2 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Câu hỏi thường gặp ({filteredFaq.length})
                  </h2>
                </div>

                <div className={`divide-y ${isDark ? "divide-white/10" : "divide-gray-100"}`}>
                  {filteredFaq.length === 0 ? (
                    <div className="px-6 py-16 text-center text-gray-500">
                      <HelpCircle size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>Không tìm thấy câu hỏi phù hợp.</p>
                    </div>
                  ) : (
                    filteredFaq.map((item) => (
                      <div key={item.id}>
                        <button
                          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          className={`w-full px-6 py-4 flex items-center justify-between text-left ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-50"} transition-colors`}
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 ${isDark ? "bg-slate-700 text-gray-300" : "bg-gray-100 text-gray-600"} rounded-full`}>
                                {item.category}
                              </span>
                            </div>
                            <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{item.question}</span>
                          </div>
                          <ChevronDown
                            size={20}
                            className={`text-gray-400 flex-shrink-0 transition-transform ${
                              expandedId === item.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {expandedId === item.id && (
                          <div className="px-6 pb-4">
                            <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm leading-relaxed`}>
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Still Need Help */}
              <div className={`mt-6 ${isDark ? "bg-amber-500/20 border-white/10" : "bg-amber-50 border-amber-200"} border rounded-xl p-5`}>
                <h3 className={`font-semibold ${isDark ? "text-amber-300" : "text-amber-800"} mb-2`}>Bạn vẫn cần hỗ trợ?</h3>
                <p className={`text-sm ${isDark ? "text-amber-300" : "text-amber-700"} mb-3`}>
                  Nếu bạn không tìm thấy câu trả lời phù hợp, đừng ngần ngại liên hệ với chúng tôi.
                </p>
                <a
                  href="mailto:support@exmora.ai"
                  className={`inline-flex items-center gap-2 text-sm font-medium ${isDark ? "text-amber-300 hover:text-amber-200" : "text-amber-800 hover:text-amber-900"}`}
                >
                  <Mail size={16} />
                  Gửi email hỗ trợ
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
