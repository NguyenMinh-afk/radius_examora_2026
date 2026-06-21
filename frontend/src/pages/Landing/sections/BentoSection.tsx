import React from "react";
import {
  FileQuestion,
  Wand2,
  Layers,
  BarChart3,
  Shield,
  Users,
  Clock,
  BookOpen,
  CheckCircle2,
  Gauge,
} from "lucide-react";

const features = [
  {
    icon: <Wand2 className="w-5 h-5" />,
    label: "AI Question Generation",
    title: "Generate exam questions from any topic in seconds",
    desc: "Enter a topic or paste lesson content — our AI instantly produces multiple-choice, true/false, fill-in-the-blank, and essay questions aligned with Bloom's taxonomy.",
    highlights: ["GPT-4 & Gemini models", "Bloom's taxonomy levels", "LaTeX & media support"],
    span: "col-span-2",
    accent: true,
    accentColor: "blue",
  },
  {
    icon: <FileQuestion className="w-5 h-5" />,
    label: "Smart Question Bank",
    title: "Organize every question with intelligent tagging",
    desc: "Import, create, and manage thousands of questions. Tag by subject, chapter, difficulty, and cognitive level with full version history.",
    highlights: ["LaTeX & image support", "Version history", "Bulk import/export"],
    accent: false,
    accentColor: "indigo",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    label: "Distributed Architecture",
    title: "RabbitMQ-powered infrastructure",
    desc: "Built on microservices with RabbitMQ message queues. Handles thousands of concurrent exam sessions without latency.",
    highlights: ["99.9% uptime SLA", "Auto-scaling compute", "Async AI processing"],
    accent: false,
    accentColor: "violet",
  },
  {
    icon: <Gauge className="w-5 h-5" />,
    label: "Adaptive Examination",
    title: "Difficulty auto-adjusts to each student's level",
    desc: "Real-time algorithm adjusts question difficulty based on student responses. Every exam session is personalized.",
    highlights: ["Real-time difficulty engine", "Personalized learning paths", "Per-student analytics"],
    span: "col-span-2",
    accent: true,
    accentColor: "purple",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: "Deep Analytics",
    title: "Insights that go beyond scores",
    desc: "Track question-level performance, time-on-task, and class-wide trends. Identify knowledge gaps before exams.",
    highlights: ["Question calibration data", "Student heatmaps", "Class comparison reports"],
    accent: false,
    accentColor: "emerald",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    label: "Exam Integrity",
    title: "Built-in fairness and anti-cheat",
    desc: "Randomized question pools, shuffle options, time limits, and role-based access control for a level playing field.",
    highlights: ["Question randomization", "Role-based access", "AES-256 encryption"],
    accent: false,
    accentColor: "amber",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Multi-Role Platform",
    title: "Dashboards for Admins, Teachers & Students",
    desc: "Each role sees exactly what they need. SSO and OAuth 2.0 integration for enterprise environments.",
    highlights: ["Admin, Teacher, Student roles", "OAuth 2.0 / SSO", "Institution hierarchy"],
    accent: false,
    accentColor: "rose",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: "Flexible Scheduling",
    title: "Set exam windows and time limits",
    desc: "Schedule exams weeks in advance or create on-demand assessments. Students receive reminders before deadlines.",
    highlights: ["Exam window scheduling", "Auto-submit rules", "Email & push reminders"],
    accent: false,
    accentColor: "cyan",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: "Subject Coverage",
    title: "STEM to humanities — all types supported",
    desc: "Rich content support including LaTeX equations, code snippets, images, audio, and video.",
    highlights: ["LaTeX / MathJax rendering", "Code syntax highlighting", "Media attachments"],
    accent: false,
    accentColor: "orange",
  },
];

const accentConfig: Record<string, {
  bg: string;
  text: string;
  border: string;
  badge: string;
  check: string;
}> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    check: "text-blue-400",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    check: "text-indigo-400",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    check: "text-violet-400",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    check: "text-purple-400",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    check: "text-emerald-400",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    check: "text-amber-400",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    check: "text-rose-400",
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-200",
    badge: "bg-cyan-100 text-cyan-700",
    check: "text-cyan-400",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    check: "text-orange-400",
  },
};

const BentoSection: React.FC = () => {
  return (
    <section id="features" className="px-6 py-24 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              Platform Features
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Everything you need for modern examinations
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A comprehensive suite of AI-powered tools built for educators who demand more
            from their exam platform.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((card) => {
            const config = accentConfig[card.accentColor];
            return (
              <div
                key={card.title}
                className={`group relative ${card.span || ""} bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden`}
              >
                {/* Top accent line for accent cards */}
                {card.accent && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                )}

                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${config.bg} ${config.text} mb-4`}>
                  {card.icon}
                </div>

                <div className={`inline-block text-xs font-semibold ${config.badge} px-2.5 py-0.5 rounded-full mb-2`}>
                  {card.label}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {card.title}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {card.desc}
                </p>

                <div className="space-y-1.5">
                  {card.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${config.check}`} />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BentoSection;
