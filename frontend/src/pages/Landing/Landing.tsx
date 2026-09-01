import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import StatsSection from "./sections/StatsSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import BentoSection from "./sections/BentoSection";
import CTASection from "./sections/CTASection";
import TestimonialsSection from "./sections/TestimonialsSection";
import PricingSection from "./sections/PricingSection";
import IntegrationsSection from "./sections/IntegrationsSection";
import VideoDemoSection from "./sections/VideoDemoSection";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import { useTheme } from "../../contexts/useTheme";

const Landing: React.FC = () => {
  const { theme } = useTheme();

  return (
    <AnimatedBackground theme={theme}>
      <div className="min-h-screen flex flex-col relative z-10">

        {/* Header - Fixed position */}
        <Header />

      {/* Main Content - Offset for fixed header */}
      <main className="relative z-10 flex flex-1 flex-col pt-16">

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row flex-1 items-center justify-center px-6 sm:px-10 lg:px-16 gap-10 lg:gap-20 py-10 lg:py-16">

          {/* Left Content */}
          <div className="max-w-xl w-full">

            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              theme === "dark" ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-700"
            }`}>
              AI POWERED EXAM PLATFORM
            </span>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 mb-5 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              The Future of{" "}
              <span className={theme === "dark" ? "text-blue-400" : "text-blue-600"}>
                Intelligent Examination
              </span>
            </h1>

            <p className={`text-lg mb-7 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              EXAMORA integrates AI, RabbitMQ distributed messaging and adaptive learning
              to build a scalable academic ecosystem.
            </p>

            {/* Buttons */}
            <div className="flex gap-4">

              <a
                href="/register"
                className={`px-6 py-3 rounded-lg hover:opacity-90 transition ${
                  theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Get Started
              </a>

              <button className={`flex items-center gap-2 px-6 py-3 border rounded-lg hover:opacity-80 transition ${
                theme === "dark" ? "border-white/20 text-white hover:bg-white/5" : "border-gray-300 hover:bg-gray-100"
              }`}>
                <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full">
                  ▶
                </span>
                Watch Demo
              </button>

            </div>

            {/* Tags */}
            <div className={`flex gap-3 mt-6 text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {["AI Generation", "RabbitMQ", "Adaptive Learning"].map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full ${
                    theme === "dark" ? "bg-white/5 border border-white/10" : "bg-white shadow"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>

          {/* AI Card */}
          <div className="relative w-full max-w-[500px]">

            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 blur-xl opacity-30 rounded-2xl" />

            <div className={`relative w-[500px] p-6 rounded-2xl shadow-2xl space-y-4 ${
              theme === "dark" ? "bg-slate-900/80 border border-white/10" : "bg-white"
            }`}>

              <div className={`flex items-center text-sm font-semibold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse mr-2 ${
                  theme === "dark" ? "bg-green-400" : "bg-green-500"
                }`} />
                AI ENGINE RUNNING
                <span className={`ml-auto text-xs ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}>
                  Processing...
                </span>
              </div>

              <div className={`p-3 rounded-lg text-sm ${
                theme === "dark" ? "bg-white/5 border border-white/10" : "bg-blue-50"
              }`}>
                <b className={`text-xs ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}>PROMPT</b>
                <p className={theme === "dark" ? "text-gray-300" : ""}>
                  Generate physics questions about quantum entanglement.
                </p>
              </div>

              <div className={`p-4 rounded-lg text-sm ${
                theme === "dark" ? "bg-indigo-600/20 border border-indigo-500/30" : "bg-blue-600"
              }`}>
                <b className={theme === "dark" ? "text-indigo-300" : ""}>GENERATED QUESTION</b>
                <p className={theme === "dark" ? "text-gray-200" : "text-white"}>
                  Explain Bell's inequality and its implications for local realism.
                </p>
              </div>

              <div className="flex gap-2 text-xs">
                {["Multiple Choice", "Bloom Level 5", "AI Generated"].map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full ${
                      theme === "dark" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

            </div>

          </div>

        </section>

        {/* Stats Section - with animated counters */}
        <StatsSection />

        {/* How It Works Section */}
        <div id="how-it-works">
          <HowItWorksSection />
        </div>

        {/* Integrations Section */}
        <IntegrationsSection />

        {/* Bento / Platform Features Section */}
        <div id="features">
          <BentoSection />
        </div>

        {/* Video Demo Section */}
        <VideoDemoSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* CTA Section */}
        <CTASection />

      </main>

      {/* Footer */}
      <Footer />
      </div>
    </AnimatedBackground>
  );
};

export default Landing;
