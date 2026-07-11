import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/useTheme";
import {
  Brain,
  Zap,
  Shield,
  Users,
  Globe,
  BarChart3,
  Code2,
  Database,
  MessageSquare,
  BookOpen,
  Award,
  Lock,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// ---- Section 1: Hero ----
const HeroSection: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <section className={`relative overflow-hidden ${isDark ? "bg-slate-900" : "bg-white"}`}>
    {/* Background decoration */}
    <div className="absolute inset-0 pointer-events-none">
      <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3 ${isDark ? "from-blue-900/30 via-indigo-900/20 to-transparent" : "from-blue-100 via-indigo-50 to-transparent"}`} />
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3 ${isDark ? "from-violet-900/30 to-indigo-900/20" : "from-violet-100 to-indigo-50"}`} />
      <div
        className={`absolute inset-0 opacity-[0.015] pointer-events-none
        bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)]
        bg-[size:60px_60px]`}
      />
    </div>

    <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-6 ${isDark ? "bg-blue-500/20 border-blue-500/30" : "bg-blue-50 border-blue-100"}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-500"}`} />
          <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? "text-blue-400" : "text-blue-600"}`}>
            About Exmora
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`text-4xl lg:text-6xl font-bold mb-6 leading-tight ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Empowering educators with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            intelligent examination
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-lg mb-8 max-w-2xl leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          Exmora is an AI-powered exam management platform designed for modern
          educational institutions. We help teachers create better questions,
          conduct smarter exams, and unlock deeper insights into student
          performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/register"
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl border transition ${isDark ? "bg-slate-800 text-gray-200 border-white/10 hover:border-white/20 hover:bg-slate-700" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
          >
            Start Free Trial
          </a>
        </motion.div>
      </div>
    </div>
  </section>
);

// ---- Section 2: Mission & Vision ----
const MissionSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const items = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Democratize quality education",
      desc: "Every educator — regardless of resources — deserves access to tools that elevate the quality of assessments and student outcomes.",
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Leverage AI for pedagogy",
      desc: "We use large language models not to replace teachers, but to augment their ability to create diverse, high-quality questions at scale.",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Scale without friction",
      desc: "Our distributed architecture, powered by RabbitMQ and microservices, means institutions can grow from hundreds to hundreds of thousands of users.",
    },
  ];

  return (
    <section className={`px-6 py-20 border-y ${isDark ? "bg-slate-800/50 border-white/10" : "bg-[#F8FAFC] border-gray-200/60"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-indigo-500/20 border-indigo-500/30" : "bg-indigo-50 border-indigo-100"}`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-indigo-400" : "bg-indigo-500"}`} />
              <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                Our Mission
              </span>
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Building the future of academic assessment
            </h2>
            <p className={`leading-relaxed mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Founded with a belief that technology should serve education — not
              the other way around — Exmora bridges the gap between traditional
              testing methods and the demands of 21st-century learning.
            </p>
            <p className={`leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              We combine cutting-edge AI, distributed systems engineering, and
              deep pedagogical research to deliver a platform where educators
              spend less time on administrative tasks and more time inspiring
              students.
            </p>
          </div>

          {/* Right: Cards */}
          <div className="grid grid-cols-1 gap-4">
            {items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className={`group rounded-xl p-5 border shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 ${isDark ? "bg-slate-800 border-white/10 hover:border-blue-500/50" : "bg-white border-gray-200"}`}
              >
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center group-hover:text-white transition-colors ${isDark ? "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600"}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 group-hover:text-blue-600 transition-colors ${isDark ? "text-white" : "text-gray-900"}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ---- Section 3: Core Values ----
const ValuesSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Data Security",
      desc: "Enterprise-grade encryption and compliance with international education data standards.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Performance First",
      desc: "Microservices and caching layers ensure sub-200ms response times at any scale.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User-Centric Design",
      desc: "Every interface decision is guided by feedback from real teachers and students.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Evidence-Based",
      desc: "Features like adaptive difficulty are grounded in Bloom's taxonomy and learning science.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Fairness & Integrity",
      desc: "Anti-cheat considerations and randomized question banks promote exam integrity.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Continuous Innovation",
      desc: "Monthly model updates ensure our AI generation stays current and accurate.",
    },
  ];

  return (
    <section className={`px-6 py-24 ${isDark ? "bg-slate-900" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-violet-500/20 border-violet-500/30" : "bg-violet-50 border-violet-100"}`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-violet-400" : "bg-violet-500"}`} />
            <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? "text-violet-400" : "text-violet-600"}`}>
              Our Values
            </span>
          </div>
          <h2 className={`text-3xl lg:text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            Principles that drive every decision
          </h2>
          <p className={`max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            From the classroom to the server room, these values guide how we build
            and how we serve.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`group rounded-2xl p-6 border hover:border-blue-200 hover:shadow-md transition-all duration-300 ${isDark ? "bg-slate-800 border-white/10" : "bg-[#F8FAFC] border-gray-200"}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:text-white transition-colors ${isDark ? "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600"}`}>
                {value.icon}
              </div>
              <h3 className={`text-base font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                {value.title}
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---- Section 4: Tech Stack ----
const TechSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const techStack = [
    { icon: <Code2 className="w-6 h-6" />, name: "Node.js / Express", category: "Backend Runtime" },
    { icon: <Layers className="w-6 h-6" />, name: "React 19 + TypeScript", category: "Frontend Framework" },
    { icon: <Database className="w-6 h-6" />, name: "PostgreSQL", category: "Primary Database" },
    { icon: <MessageSquare className="w-6 h-6" />, name: "RabbitMQ", category: "Message Broker" },
    { icon: <Brain className="w-6 h-6" />, name: "GPT-4 & Gemini", category: "AI Models" },
    { icon: <Cpu className="w-6 h-6" />, name: "Go / Microservices", category: "Scalable Services" },
    { icon: <Shield className="w-6 h-6" />, name: "JWT + OAuth 2.0", category: "Authentication" },
    { icon: <Globe className="w-6 h-6" />, name: "Docker & Kubernetes", category: "Infrastructure" },
  ];

  return (
    <section className={`px-6 py-24 border-y ${isDark ? "bg-slate-800/50 border-white/10" : "bg-[#F8FAFC] border-gray-200/60"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-blue-500/20 border-blue-500/30" : "bg-blue-50 border-blue-100"}`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-500"}`} />
            <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              Technology
            </span>
          </div>
          <h2 className={`text-3xl lg:text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            Built on proven, modern technology
          </h2>
          <p className={`max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            We choose our tools based on reliability, scalability, and the ability
            to serve educators at any institution size.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className={`group rounded-xl p-5 border shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 text-center ${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-200"}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${isDark ? "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white" : "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white"}`}>
                {tech.icon}
              </div>
              <div className={`text-sm font-bold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                {tech.name}
              </div>
              <div className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {tech.category}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---- Section 5: Journey / Milestones ----
const JourneySection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const milestones = [
    { year: "2023", title: "Platform Founded", desc: "Started with a simple idea: make AI-generated questions accessible to every teacher." },
    { year: "2024 Q1", title: "Beta Launch", desc: "Rolled out to 10 pilot institutions. Gathered real-world feedback from educators." },
    { year: "2024 Q3", title: "AI Generation v2", desc: "Integrated GPT-4 and Gemini. Bloom's taxonomy alignment added to question generation." },
    { year: "2025", title: "Microservices Architecture", desc: "Rebuilt backend on RabbitMQ microservices. Achieved 99.9% uptime SLA." },
    { year: "2025 Q4", title: "500+ Institutions", desc: "Expanded across Vietnam and Southeast Asia. Multi-language support launched." },
    { year: "2026", title: "Adaptive Learning", desc: "Introduced real-time difficulty adjustment based on student performance analytics." },
  ];

  return (
    <section className={`px-6 py-24 ${isDark ? "bg-slate-900" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-indigo-500/20 border-indigo-500/30" : "bg-indigo-50 border-indigo-100"}`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-indigo-400" : "bg-indigo-500"}`} />
            <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
              Our Journey
            </span>
          </div>
          <h2 className={`text-3xl lg:text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            From concept to 500+ institutions
          </h2>
          <p className={`max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Three years of relentless iteration, guided by what educators
            actually need.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className={`absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b ${isDark ? "from-blue-500/50 via-indigo-500/50 to-violet-500/50" : "from-blue-400 via-indigo-400 to-violet-400"}`} />

          <div className="space-y-8">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                className={`relative flex items-start gap-6 lg:gap-0 ${
                  i % 2 === 0 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline dot */}
                <div className={`absolute left-4 lg:left-1/2 -translate-x-1/2 w-3 h-3 border-2 rounded-full z-10 mt-5 shadow-sm ${isDark ? "bg-slate-900 border-blue-400 shadow-blue-400/30" : "bg-white border-blue-500 shadow-blue-500/30"}`} />

                {/* Content card */}
                <div className={`ml-10 lg:ml-0 lg:w-5/12 ${i % 2 === 0 ? "lg:pr-10" : "lg:pl-10"}`}>
                  <div className={`rounded-xl p-5 border hover:border-blue-200 hover:shadow-md transition-all duration-300 ${isDark ? "bg-slate-800 border-white/10" : "bg-[#F8FAFC] border-gray-200"}`}>
                    <div className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg mb-2 ${isDark ? "text-blue-400 bg-blue-500/20" : "text-blue-600 bg-blue-50"}`}>
                      {m.year}
                    </div>
                    <h3 className={`text-base font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {m.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {m.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ---- Section 6: Team / Open Roles ----
const TeamSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const roles = [
    { title: "Senior AI Engineer", type: "Full-time", location: "Remote / Hanoi" },
    { title: "Frontend Developer", type: "Full-time", location: "Hanoi, Vietnam" },
    { title: "Backend Developer (Go)", type: "Full-time", location: "Remote" },
    { title: "Education Researcher", type: "Part-time", location: "Remote" },
  ];

  return (
    <section className={`px-6 py-24 border-y ${isDark ? "bg-slate-800/50 border-white/10" : "bg-[#F8FAFC] border-gray-200/60"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Message */}
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-violet-500/20 border-violet-500/30" : "bg-violet-50 border-violet-100"}`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-violet-400" : "bg-violet-500"}`} />
              <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                Join Us
              </span>
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              We&apos;re building something meaningful
            </h2>
            <p className={`leading-relaxed mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Education is one of the most impactful areas where technology can
              make a difference. If you&apos;re passionate about AI, distributed
              systems, or educational technology, we&apos;d love to hear from you.
            </p>
            <a
              href="/contact"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition shadow-lg shadow-violet-600/20"
            >
              View Open Positions
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Right: Open roles */}
          <div className="space-y-3">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
                className={`group rounded-xl p-4 border hover:border-violet-200 hover:shadow-md transition-all duration-300 flex items-center justify-between ${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-200"}`}
              >
                <div>
                  <h3 className={`font-semibold group-hover:text-violet-600 transition-colors ${isDark ? "text-white" : "text-gray-900"}`}>
                    {role.title}
                  </h3>
                  <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {role.type}
                    </span>
                    <span>{role.location}</span>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${isDark ? "text-gray-500 group-hover:text-violet-400" : "text-gray-300 group-hover:text-violet-500"}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ---- Section 7: CTA ----
const CTASection: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <section className={`px-6 py-20 ${isDark ? "bg-slate-900" : "bg-white"}`}>
    <div className="max-w-6xl mx-auto">
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none
          bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)]
          bg-[size:50px_50px]"
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 px-10 py-16 lg:px-16 lg:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-white/90 tracking-wider uppercase">
              Free 14-day trial
            </span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Ready to get started?
          </h2>
          <p className="text-blue-100 text-base lg:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Join 500+ institutions already transforming their examinations with
            Exmora. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition shadow-xl shadow-blue-900/20 hover:-translate-y-0.5"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition border border-white/20"
            >
              Talk to Us
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-blue-200/70 text-sm">
            {["No credit card required", "24/7 Support", "Cancel anytime"].map(
              (item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ---- Main Page ----
const About: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-slate-900" : "bg-white"}`}>
      <Header />
      <main className="flex-1">
        <HeroSection isDark={isDark} />
        <MissionSection isDark={isDark} />
        <ValuesSection isDark={isDark} />
        <TechSection isDark={isDark} />
        <JourneySection isDark={isDark} />
        <TeamSection isDark={isDark} />
        <CTASection isDark={isDark} />
      </main>
      <Footer />
    </div>
  );
};

export default About;
