import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/useTheme";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
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

      {/* Floating 3D-like elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-32 right-20 lg:right-40 w-20 h-20 rounded-2xl border-2 ${isDark ? "border-blue-500/30 bg-blue-500/10" : "border-blue-300 bg-blue-100/50"}`}
      />
      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, -8, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={`absolute bottom-40 left-16 lg:left-32 w-16 h-16 rounded-xl border-2 ${isDark ? "border-violet-500/30 bg-violet-500/10" : "border-violet-300 bg-violet-100/50"}`}
      />
      <motion.div
        animate={{
          y: [0, -25, 0],
          x: [0, 10, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className={`absolute top-1/2 right-1/4 w-12 h-12 rounded-full border-2 ${isDark ? "border-cyan-500/30 bg-cyan-500/10" : "border-cyan-300 bg-cyan-100/50"}`}
      />

      {/* Animated glow ring */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute top-1/4 right-1/4 w-40 h-40 rounded-full ${isDark ? "bg-gradient-to-r from-blue-500/20 to-violet-500/20" : "bg-gradient-to-r from-blue-300/30 to-violet-300/30"} blur-2xl`}
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
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-500"}`}
          />
          <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? "text-blue-400" : "text-blue-600"}`}>
            About Examora
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-4xl lg:text-6xl font-bold mb-6 leading-tight ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Empowering educators with{" "}
          <motion.span
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] bg-clip-text text-transparent"
          >
            intelligent examination
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-lg mb-8 max-w-2xl leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          Examora is an AI-powered exam management platform designed for modern
          educational institutions. We help teachers create better questions,
          conduct smarter exams, and unlock deeper insights into student
          performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
          >
            Get in Touch
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.a>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl border transition ${isDark ? "bg-slate-800 text-gray-200 border-white/10 hover:border-white/20 hover:bg-slate-700" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
          >
            Start Free Trial
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-3 gap-6"
        >
          {[
            { value: "500+", label: "Institutions" },
            { value: "1M+", label: "Questions Generated" },
            { value: "99.9%", label: "Uptime SLA" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                className={`text-2xl lg:text-3xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {stat.value}
              </motion.div>
              <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {stat.label}
              </div>
            </motion.div>
          ))}
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
      color: "blue",
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Leverage AI for pedagogy",
      desc: "We use large language models not to replace teachers, but to augment their ability to create diverse, high-quality questions at scale.",
      color: "indigo",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Scale without friction",
      desc: "Our distributed architecture, powered by RabbitMQ and microservices, means institutions can grow from hundreds to hundreds of thousands of users.",
      color: "violet",
    },
  ];

  const colorMap = {
    blue: {
      bg: isDark ? "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
      border: isDark ? "hover:border-blue-500/50" : "hover:border-blue-300",
    },
    indigo: {
      bg: isDark ? "bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600",
      border: isDark ? "hover:border-indigo-500/50" : "hover:border-indigo-300",
    },
    violet: {
      bg: isDark ? "bg-violet-500/20 text-violet-400 group-hover:bg-violet-500 group-hover:text-white" : "bg-violet-50 text-violet-600 group-hover:bg-violet-600",
      border: isDark ? "hover:border-violet-500/50" : "hover:border-violet-300",
    },
  };

  return (
    <section className={`px-6 py-20 border-y ${isDark ? "bg-slate-800/50 border-white/10" : "bg-[#F8FAFC] border-gray-200/60"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-indigo-500/20 border-indigo-500/30" : "bg-indigo-50 border-indigo-100"}`}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-indigo-400" : "bg-indigo-500"}`}
              />
              <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                Our Mission
              </span>
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Building the future of academic assessment
            </h2>
            <p className={`leading-relaxed mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Founded with a belief that technology should serve education — not
              the other way around — Examora bridges the gap between traditional
              testing methods and the demands of 21st-century learning.
            </p>
            <p className={`leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              We combine cutting-edge AI, distributed systems engineering, and
              deep pedagogical research to deliver a platform where educators
              spend less time on administrative tasks and more time inspiring
              students.
            </p>
          </motion.div>

          {/* Right: Cards */}
          <div className="grid grid-cols-1 gap-4">
            {items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`group rounded-xl p-5 border shadow-sm hover:shadow-lg transition-all duration-300 ${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-200"} ${colorMap[item.color as keyof typeof colorMap].border}`}
              >
                <motion.div
                  className="flex gap-4"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${colorMap[item.color as keyof typeof colorMap].bg}`}>
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
                </motion.div>
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
      color: "blue",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Performance First",
      desc: "Microservices and caching layers ensure sub-200ms response times at any scale.",
      color: "indigo",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User-Centric Design",
      desc: "Every interface decision is guided by feedback from real teachers and students.",
      color: "violet",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Evidence-Based",
      desc: "Features like adaptive difficulty are grounded in Bloom's taxonomy and learning science.",
      color: "blue",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Fairness & Integrity",
      desc: "Anti-cheat considerations and randomized question banks promote exam integrity.",
      color: "indigo",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Continuous Innovation",
      desc: "Monthly model updates ensure our AI generation stays current and accurate.",
      color: "violet",
    },
  ];

  return (
    <section className={`px-6 py-24 ${isDark ? "bg-slate-900" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-violet-500/20 border-violet-500/30" : "bg-violet-50 border-violet-100"}`}>
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-violet-400" : "bg-violet-500"}`}
            />
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
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 cursor-pointer ${isDark ? "bg-slate-800 border-white/10 hover:border-violet-500/50" : "bg-[#F8FAFC] border-gray-200 hover:border-blue-300 hover:shadow-lg"}`}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${isDark ? "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"}`}
              >
                {value.icon}
              </motion.div>
              <h3 className={`text-base font-bold mb-2 transition-colors ${isDark ? "text-white group-hover:text-violet-400" : "text-gray-900 group-hover:text-blue-600"}`}>
                {value.title}
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {value.desc}
              </p>
              <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                className={`h-0.5 mt-4 origin-left ${isDark ? "bg-gradient-to-r from-violet-500 to-blue-500" : "bg-gradient-to-r from-blue-500 to-violet-500"}`}
              />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-blue-500/20 border-blue-500/30" : "bg-blue-50 border-blue-100"}`}>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-500"}`}
            />
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
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{
                scale: 1.08,
                y: -5,
                boxShadow: isDark
                  ? "0 20px 40px -10px rgba(99, 102, 241, 0.3)"
                  : "0 20px 40px -10px rgba(59, 130, 246, 0.2)",
              }}
              className={`group rounded-xl p-5 border shadow-sm transition-all duration-300 text-center ${isDark ? "bg-slate-800 border-white/10 hover:border-blue-500/50" : "bg-white border-gray-200 hover:border-blue-300"}`}
            >
              <motion.div
                whileHover={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 0.5 }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${isDark ? "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white" : "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white"}`}
              >
                {tech.icon}
              </motion.div>
              <div className={`text-sm font-bold mb-0.5 transition-colors ${isDark ? "text-white group-hover:text-blue-400" : "text-gray-900 group-hover:text-blue-600"}`}>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-indigo-500/20 border-indigo-500/30" : "bg-indigo-50 border-indigo-100"}`}>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-indigo-400" : "bg-indigo-500"}`}
            />
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
        </motion.div>

        <div className="relative">
          {/* Animated vertical line with glow */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute left-4 lg:left-1/2 top-0 bottom-0 w-px ${isDark ? "bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500" : "bg-gradient-to-b from-blue-400 via-indigo-400 to-violet-400"}`}
          />
          <div className={`absolute left-4 lg:left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 bg-gradient-to-b from-blue-500/20 to-violet-500/20 blur-xl ${isDark ? "opacity-50" : "opacity-30"}`} />

          <div className="space-y-8">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`relative flex items-start gap-6 lg:gap-0 ${
                  i % 2 === 0 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline dot with glow */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.3, type: "spring" }}
                  className={`absolute left-4 lg:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10 mt-5 ${isDark ? "bg-blue-500 shadow-lg shadow-blue-500/50" : "bg-blue-500 shadow-lg shadow-blue-500/30"}`}
                >
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full ${isDark ? "bg-blue-400" : "bg-blue-300"}`}
                  />
                </motion.div>

                {/* Content card */}
                <div className={`ml-10 lg:ml-0 lg:w-5/12 ${i % 2 === 0 ? "lg:pr-10" : "lg:pl-10"}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`rounded-xl p-5 border hover:shadow-lg transition-all duration-300 ${isDark ? "bg-slate-800 border-white/10 hover:border-blue-500/50" : "bg-[#F8FAFC] border-gray-200 hover:border-blue-300"}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.2 }}
                      className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg mb-2 ${isDark ? "text-blue-400 bg-blue-500/20" : "text-blue-600 bg-blue-50"}`}
                    >
                      {m.year}
                    </motion.div>
                    <h3 className={`text-base font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {m.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {m.desc}
                    </p>
                  </motion.div>
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
    { title: "Senior AI Engineer", type: "Full-time", location: "Remote / Hanoi", color: "blue" },
    { title: "Frontend Developer", type: "Full-time", location: "Hanoi, Vietnam", color: "violet" },
    { title: "Backend Developer (Go)", type: "Full-time", location: "Remote", color: "indigo" },
    { title: "Education Researcher", type: "Part-time", location: "Remote", color: "blue" },
  ];

  const colorMap = {
    blue: "hover:border-blue-400 hover:shadow-blue-500/20",
    indigo: "hover:border-indigo-400 hover:shadow-indigo-500/20",
    violet: "hover:border-violet-400 hover:shadow-violet-500/20",
  };

  return (
    <section className={`px-6 py-24 border-y ${isDark ? "bg-slate-800/50 border-white/10" : "bg-[#F8FAFC] border-gray-200/60"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Message */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${isDark ? "bg-violet-500/20 border-violet-500/30" : "bg-violet-50 border-violet-100"}`}>
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-violet-400" : "bg-violet-500"}`}
              />
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
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition shadow-lg shadow-violet-600/20"
            >
              View Open Positions
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.a>
          </motion.div>

          {/* Right: Open roles */}
          <div className="space-y-3">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ x: 8, scale: 1.01 }}
                className={`group rounded-xl p-4 border hover:shadow-lg transition-all duration-300 flex items-center justify-between ${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-200"} ${colorMap[role.color as keyof typeof colorMap]}`}
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
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${isDark ? "text-gray-500 group-hover:text-violet-400" : "text-gray-300 group-hover:text-violet-500"}`} />
                </motion.div>
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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none
          bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)]
          bg-[size:50px_50px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl"
        />

        <div className="relative z-10 px-10 py-16 lg:px-16 lg:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-green-400 rounded-full"
            />
            <span className="text-xs font-semibold text-white/90 tracking-wider uppercase">
              Free 14-day trial
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-blue-100 text-base lg:text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Join 500+ institutions already transforming their examinations with
            Examora. No credit card required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition shadow-xl shadow-blue-900/20"
            >
              Start Free Trial
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.a>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition border border-white/20"
            >
              Talk to Us
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-blue-200/70 text-sm"
          >
            {["No credit card required", "24/7 Support", "Cancel anytime"].map(
              (item) => (
                <motion.div
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {item}
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

// ---- Main Page ----
const About: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <AnimatedBackground theme={theme}>
      <div className="min-h-screen flex flex-col relative z-10">
        <Header />
        <main className="flex-1 pt-16">
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
    </AnimatedBackground>
  );
};

export default About;
