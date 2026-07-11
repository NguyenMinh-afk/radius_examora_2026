import React from "react";
import { useTheme } from "../../../contexts/useTheme";
import { UserPlus, Wand2, LayoutList, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Quick Onboarding",
    desc: "Sign up with email or SSO. Choose your role — Admin, Teacher, or Student — and access your personalized dashboard instantly.",
    badge: "Get Started",
    icon: <UserPlus className="w-6 h-6" />,
    details: ["Email / SSO login", "Role selection", "Institution setup"],
    note: "Setup in < 15 minutes",
  },
  {
    number: "02",
    title: "AI-Powered Question Generation",
    desc: "Enter a topic or paste lesson content. Choose question types and Bloom's level. Review, edit, and save directly to your question bank.",
    badge: "AI-Powered",
    icon: <Wand2 className="w-6 h-6" />,
    details: ["GPT-4 & Gemini models", "Bloom's taxonomy levels", "LaTeX & media support"],
    note: "100+ questions/minute",
  },
  {
    number: "03",
    title: "Build & Assign Exams",
    desc: "Drag questions from your bank into exam sessions. Set time limits, randomization, and schedule. Students receive automatic notifications.",
    badge: "Exam Builder",
    icon: <LayoutList className="w-6 h-6" />,
    details: ["Randomization engine", "Time & attempt controls", "Auto notifications"],
    note: "No-code exam creation",
  },
  {
    number: "04",
    title: "Analytics & Adaptive Learning",
    desc: "View individual scores, class distributions, and question analytics. Exmora's adaptive engine personalizes future sessions automatically.",
    badge: "Analytics",
    icon: <BarChart3 className="w-6 h-6" />,
    details: ["Real-time tracking", "Question calibration", "Adaptive engine"],
    note: "Personalized learning paths",
  },
];

const HowItWorksSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section id="how-it-works" className={`px-6 py-24 ${isDark ? "" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${
            isDark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-blue-50 border-blue-100"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isDark ? "bg-indigo-400" : "bg-blue-500"
            }`} />
            <span className={`text-xs font-semibold tracking-wider uppercase ${
              isDark ? "text-indigo-400" : "text-blue-600"
            }`}>
              Simple Process
            </span>
          </div>
          <h2 className={`text-3xl lg:text-4xl font-bold mb-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Four steps to smarter examinations
          </h2>
          <p className={`max-w-xl mx-auto ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            From account creation to AI-powered grading — everything streamlined
            for educators and students.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`group relative rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 ${
                isDark 
                  ? "bg-slate-800/50 border-white/10 hover:border-indigo-500/30 hover:bg-slate-800/70" 
                  : "bg-white border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="flex gap-5">
                {/* Step Number */}
                <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br rounded-xl flex flex-col items-center justify-center shadow-sm ${
                  isDark 
                    ? "from-indigo-600 to-violet-600 shadow-indigo-500/20" 
                    : "from-blue-600 to-indigo-600 shadow-blue-600/20"
                }`}>
                  <span className="text-[10px] font-medium text-blue-200 uppercase tracking-wide">
                    Step
                  </span>
                  <span className="text-lg font-bold text-white leading-none">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                      isDark ? "text-indigo-300 bg-indigo-500/20" : "text-blue-600 bg-blue-50"
                    }`}>
                      {step.badge}
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {step.note}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold mb-2 group-hover:transition-colors ${
                    isDark 
                      ? "text-white group-hover:text-indigo-400" 
                      : "text-gray-900 group-hover:text-blue-600"
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-3 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {step.desc}
                  </p>
                  {/* Detail pills */}
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((detail) => (
                      <span
                        key={detail}
                        className={`text-xs px-2.5 py-1 rounded-full border ${
                          isDark 
                            ? "text-gray-400 bg-white/5 border-white/10" 
                            : "text-gray-500 bg-gray-50 border-gray-200"
                        }`}
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`hidden md:block absolute left-[3.25rem] -bottom-6 w-px h-6 ${
                  isDark ? "from-indigo-500/30 to-transparent" : "from-blue-200 to-transparent"
                }`}
                  style={{ background: isDark 
                    ? "linear-gradient(to bottom, rgba(99, 102, 241, 0.3), transparent)" 
                    : "linear-gradient(to bottom, #c7d2fe, transparent)"
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
