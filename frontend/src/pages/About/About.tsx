import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { motion } from "framer-motion";
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
const HeroSection: React.FC = () => (
  <section className="relative bg-white overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100 via-indigo-50 to-transparent rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-100 to-indigo-50 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3" />
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none
        bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)]
        bg-[size:60px_60px]"
      />
    </div>

    <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-6"
        >
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
            About Exmora
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
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
          className="text-lg text-gray-500 mb-8 max-w-2xl leading-relaxed"
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
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
          >
            Start Free Trial
          </a>
        </motion.div>
      </div>
    </div>
  </section>
);

// ---- Section 2: Mission & Vision ----
const MissionSection: React.FC = () => {
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
    <section className="px-6 py-20 bg-[#F8FAFC] border-y border-gray-200/60">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
                Our Mission
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Building the future of academic assessment
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Founded with a belief that technology should serve education — not
              the other way around — Exmora bridges the gap between traditional
              testing methods and the demands of 21st-century learning.
            </p>
            <p className="text-gray-500 leading-relaxed">
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
                className="group bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
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
const ValuesSection: React.FC = () => {
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
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-50 border border-violet-100 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-violet-600 tracking-wider uppercase">
              Our Values
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Principles that drive every decision
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
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
              className="group bg-[#F8FAFC] rounded-2xl p-6 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {value.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
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
const TechSection: React.FC = () => {
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
    <section className="px-6 py-24 bg-[#F8FAFC] border-y border-gray-200/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
              Technology
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Built on proven, modern technology
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
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
              className="group bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300">
                {tech.icon}
              </div>
              <div className="text-sm font-bold text-gray-900 mb-0.5">
                {tech.name}
              </div>
              <div className="text-xs text-gray-400 font-medium">
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
const JourneySection: React.FC = () => {
  const milestones = [
    { year: "2023", title: "Platform Founded", desc: "Started with a simple idea: make AI-generated questions accessible to every teacher." },
    { year: "2024 Q1", title: "Beta Launch", desc: "Rolled out to 10 pilot institutions. Gathered real-world feedback from educators." },
    { year: "2024 Q3", title: "AI Generation v2", desc: "Integrated GPT-4 and Gemini. Bloom's taxonomy alignment added to question generation." },
    { year: "2025", title: "Microservices Architecture", desc: "Rebuilt backend on RabbitMQ microservices. Achieved 99.9% uptime SLA." },
    { year: "2025 Q4", title: "500+ Institutions", desc: "Expanded across Vietnam and Southeast Asia. Multi-language support launched." },
    { year: "2026", title: "Adaptive Learning", desc: "Introduced real-time difficulty adjustment based on student performance analytics." },
  ];

  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              Our Journey
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            From concept to 500+ institutions
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Three years of relentless iteration, guided by what educators
            actually need.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400 via-indigo-400 to-violet-400" />

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
                <div className="absolute left-4 lg:left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full z-10 mt-5 shadow-sm shadow-blue-500/30" />

                {/* Content card */}
                <div className={`ml-10 lg:ml-0 lg:w-5/12 ${i % 2 === 0 ? "lg:pr-10" : "lg:pl-10"}`}>
                  <div className="bg-[#F8FAFC] rounded-xl p-5 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                    <div className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg mb-2">
                      {m.year}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {m.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
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
const TeamSection: React.FC = () => {
  const roles = [
    { title: "Senior AI Engineer", type: "Full-time", location: "Remote / Hanoi" },
    { title: "Frontend Developer", type: "Full-time", location: "Hanoi, Vietnam" },
    { title: "Backend Developer (Go)", type: "Full-time", location: "Remote" },
    { title: "Education Researcher", type: "Part-time", location: "Remote" },
  ];

  return (
    <section className="px-6 py-24 bg-[#F8FAFC] border-y border-gray-200/60">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Message */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-50 border border-violet-100 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-violet-600 tracking-wider uppercase">
                Join Us
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              We&apos;re building something meaningful
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
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
                className="group bg-white rounded-xl p-4 border border-gray-200 hover:border-violet-200 hover:shadow-md transition-all duration-300 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                    {role.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {role.type}
                    </span>
                    <span>{role.location}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ---- Section 7: CTA ----
const CTASection: React.FC = () => (
  <section className="px-6 py-20 bg-white">
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
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <MissionSection />
        <ValuesSection />
        <TechSection />
        <JourneySection />
        <TeamSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
