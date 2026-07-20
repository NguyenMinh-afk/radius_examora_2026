import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { Star, Quote, ChevronLeft, ChevronRight, Building2, GraduationCap, Award } from "lucide-react";

const testimonials = [
  {
    quote: "EXMORA has completely transformed how our university conducts examinations. The AI-generated questions are remarkably accurate and aligned with our curriculum.",
    name: "Dr. Sarah Chen",
    role: "Dean of Academic Affairs",
    institution: "Stanford University",
    icon: <GraduationCap className="w-5 h-5" />,
    rating: 5,
    avatar: "SC"
  },
  {
    quote: "The adaptive examination feature is a game-changer. Our students now receive personalized assessments that truly measure their understanding, not just memorization.",
    name: "Prof. Michael Roberts",
    role: "Head of Computer Science",
    institution: "MIT",
    icon: <Building2 className="w-5 h-5" />,
    rating: 5,
    avatar: "MR"
  },
  {
    quote: "Integration with our existing LMS took less than a day. The team's support is exceptional, and the platform scales beautifully during peak exam periods.",
    name: "Dr. Emily Watson",
    role: "Director of Assessment",
    institution: "Oxford University",
    icon: <Award className="w-5 h-5" />,
    rating: 5,
    avatar: "EW"
  },
  {
    quote: "We've seen a 40% reduction in exam-related complaints since switching to EXMORA. The analytics help us identify knowledge gaps before they become problems.",
    name: "James Thompson",
    role: "IT Director",
    institution: "Duke University",
    icon: <Building2 className="w-5 h-5" />,
    rating: 5,
    avatar: "JT"
  },
  {
    quote: "As a student, I appreciate how the adaptive system adjusts to my learning pace. It makes exams less stressful and more about genuine understanding.",
    name: "Lisa Park",
    role: "Graduate Student",
    institution: "UC Berkeley",
    icon: <GraduationCap className="w-5 h-5" />,
    rating: 5,
    avatar: "LP"
  },
];

const avatarColors = [
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-purple-500 to-pink-600",
  "bg-gradient-to-br from-orange-500 to-red-600",
  "bg-gradient-to-br from-cyan-500 to-blue-600",
];

const TestimonialsSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const current = testimonials[currentIndex];

  return (
    <section className={`px-6 py-24 ${isDark ? "" : "bg-gradient-to-b from-white to-blue-50/30"}`}>
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
              Testimonials
            </span>
          </div>
          <h2 className={`text-3xl lg:text-4xl font-bold mb-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Trusted by educators worldwide
          </h2>
          <p className={`max-w-xl mx-auto ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            See what universities and institutions say about transforming their examination process with EXMORA.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Main Card */}
          <div className={`rounded-3xl shadow-xl border p-8 md:p-12 relative overflow-hidden ${
            isDark ? "bg-slate-800/80 border-white/10" : "bg-white border-gray-100"
          }`}>
            {/* Quote Icon */}
            <div className={`absolute top-6 right-8 opacity-5 ${
              isDark ? "text-indigo-400" : "text-blue-600"
            }`}>
              <Quote className="w-32 h-32" />
            </div>

            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: isDark 
                  ? `linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)` 
                  : "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }}
            />

            <div className="relative z-10">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className={`text-xl md:text-2xl leading-relaxed mb-8 font-medium ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}>
                "{current.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${avatarColors[currentIndex]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {current.avatar}
                </div>
                <div>
                  <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{current.name}</div>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{current.role}</div>
                  <div className={`flex items-center gap-1.5 text-sm mt-0.5 ${
                    isDark ? "text-indigo-400" : "text-blue-600"
                  }`}>
                    {current.icon}
                    {current.institution}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border ${
              isDark 
                ? "bg-slate-800 border-white/10 text-gray-300 hover:text-indigo-400 hover:border-indigo-500/30" 
                : "bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border ${
              isDark 
                ? "bg-slate-800 border-white/10 text-gray-300 hover:text-indigo-400 hover:border-indigo-500/30" 
                : "bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? isDark ? "bg-indigo-500 w-8" : "bg-blue-600 w-8"
                    : isDark ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust Logos */}
        <div className="mt-16 text-center">
          <p className={`text-sm mb-6 ${isDark ? "text-gray-500" : "text-gray-500"}`}>Trusted by institutions including</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {["Stanford", "MIT", "Oxford", "Harvard", "Berkeley", "Duke"].map((uni) => (
              <div key={uni} className={`text-lg font-bold tracking-tight ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}>
                {uni}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
