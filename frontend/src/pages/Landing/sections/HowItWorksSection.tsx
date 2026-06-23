import React from "react";
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
  return (
    <section id="how-it-works" className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Four steps to smarter examinations
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            From account creation to AI-powered grading — everything streamlined
            for educators and students.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
            >
              <div className="flex gap-5">
                {/* Step Number */}
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex flex-col items-center justify-center shadow-sm shadow-blue-600/20">
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
                    <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {step.badge}
                    </span>
                    <span className="text-xs text-gray-400">
                      {step.note}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    {step.desc}
                  </p>
                  {/* Detail pills */}
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((detail) => (
                      <span
                        key={detail}
                        className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-[3.25rem] -bottom-6 w-px h-6 bg-gradient-to-b from-blue-200 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
