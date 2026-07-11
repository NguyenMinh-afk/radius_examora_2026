import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../contexts/useTheme";

interface Stat {
  value: string;
  numericValue: number;
  label: string;
  trend: string;
  suffix?: string;
  prefix?: string;
}

const stats: Stat[] = [
  { value: "10,000+", numericValue: 10000, label: "Questions Generated", trend: "+12% this month", suffix: "+" },
  { value: "500+", numericValue: 500, label: "Active Institutions", trend: "Growing community", suffix: "+" },
  { value: "99.9%", numericValue: 99.9, label: "Uptime SLA", trend: "Enterprise-grade", suffix: "%" },
  { value: "50,000+", numericValue: 50000, label: "Exams Conducted", trend: "+8K this year", suffix: "+" },
];

const useCountUp = (end: number, duration: number = 2000, start: number = 0, isInView: boolean = false) => {
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!isInView || hasAnimated) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (end - start) * easeOutQuart;
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, end, duration, start, hasAnimated]);

  return count;
};

interface AnimatedNumberProps {
  stat: Stat;
  isInView: boolean;
  isDark: boolean;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ stat, isInView, isDark }) => {
  const count = useCountUp(stat.numericValue, 2000, 0, isInView);
  
  // Format the number based on the suffix/prefix
  const formatNumber = (num: number): string => {
    if (stat.suffix === "%") {
      return num.toFixed(1);
    }
    if (stat.suffix === "+") {
      if (num >= 1000) {
        return Math.floor(num).toLocaleString();
      }
      return Math.floor(num).toString();
    }
    return Math.floor(num).toLocaleString();
  };

  return (
    <div className={`text-3xl lg:text-4xl font-bold bg-clip-text mb-1 ${
      isDark 
        ? "bg-gradient-to-r from-indigo-400 to-violet-400 text-transparent" 
        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent"
    }`}>
      {stat.prefix || ""}{formatNumber(count)}{stat.suffix || ""}
    </div>
  );
};

const StatsSection: React.FC = () => {
  const { theme } = useTheme();
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`px-6 py-20 border-y ${
      isDark ? "bg-slate-900/50 border-white/10" : "bg-[#F8FAFC] border-gray-200/60"
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative group"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.6s ease-out ${index * 0.1}s`
              }}
            >
              {/* Hover Effect */}
              <div className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isDark ? "bg-gradient-to-b from-indigo-500/10 to-violet-500/10" : "bg-gradient-to-b from-blue-600/10 to-indigo-600/10"
              }`} />
              
              <div className={`relative rounded-2xl p-6 text-center border shadow-sm hover:shadow-md transition-all duration-300 ${
                isDark 
                  ? "bg-slate-800/50 border-white/10 hover:border-indigo-500/30" 
                  : "bg-white border-gray-200/50 hover:border-blue-200"
              }`}>
                {/* Animated Number */}
                <AnimatedNumber stat={stat} isInView={isInView} isDark={isDark} />
                
                {/* Label */}
                <div className={`text-sm font-medium mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  {stat.label}
                </div>
                
                {/* Trend Badge */}
                <div 
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    isDark ? "text-indigo-400 bg-indigo-500/10" : "text-blue-600 bg-blue-50"
                  }`}
                  style={{
                    opacity: isInView ? 1 : 0,
                    transition: `opacity 0.4s ease-out ${0.4 + index * 0.1}s`
                  }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isDark ? "bg-indigo-400" : "bg-blue-500"
                  }`} />
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats Bar */}
        <div 
          className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4"
          style={{
            opacity: isInView ? 1 : 0,
            transition: "opacity 0.6s ease-out 0.8s"
          }}
        >
          {[
            { label: "Countries", value: "45+" },
            { label: "Languages", value: "20+" },
            { label: "Integrations", value: "15+" },
            { label: "Support Rating", value: "4.9/5" },
          ].map((item) => (
            <div
              key={item.label}
              className={`text-center p-4 rounded-xl border ${
                isDark ? "bg-white/5 border-white/10" : "bg-white/50 border-gray-100"
              }`}
            >
              <div className={`text-xl font-bold ${isDark ? "text-gray-200" : "text-gray-700}"}`}>{item.value}</div>
              <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
