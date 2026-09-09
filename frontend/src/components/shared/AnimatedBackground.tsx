import React from "react";
import { type Theme } from "../../contexts/theme";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  theme?: Theme;
}

// Pre-generated floating shapes for consistent rendering
const FLOATING_SHAPES = [
  { id: 0, left: "10%", top: "20%", size: 24, shape: "circle" as const, duration: "18s", delay: "0s" },
  { id: 1, left: "85%", top: "15%", size: 32, shape: "hexagon" as const, duration: "22s", delay: "2s" },
  { id: 2, left: "25%", top: "70%", size: 20, shape: "square" as const, duration: "16s", delay: "1s" },
  { id: 3, left: "75%", top: "60%", size: 28, shape: "circle" as const, duration: "20s", delay: "3s" },
  { id: 4, left: "5%", top: "55%", size: 18, shape: "plus" as const, duration: "14s", delay: "0.5s" },
  { id: 5, left: "90%", top: "40%", size: 26, shape: "hexagon" as const, duration: "19s", delay: "2.5s" },
  { id: 6, left: "45%", top: "85%", size: 22, shape: "square" as const, duration: "17s", delay: "1.5s" },
  { id: 7, left: "60%", top: "10%", size: 30, shape: "circle" as const, duration: "21s", delay: "4s" },
  { id: 8, left: "15%", top: "40%", size: 16, shape: "plus" as const, duration: "15s", delay: "3.5s" },
  { id: 9, left: "80%", top: "80%", size: 24, shape: "hexagon" as const, duration: "18s", delay: "2s" },
  { id: 10, left: "35%", top: "25%", size: 20, shape: "circle" as const, duration: "16s", delay: "1s" },
  { id: 11, left: "70%", top: "35%", size: 18, shape: "square" as const, duration: "20s", delay: "0s" },
  { id: 12, left: "50%", top: "55%", size: 22, shape: "plus" as const, duration: "17s", delay: "2.5s" },
];

// Light mode sparkle particles
const LIGHT_PARTICLES = [
  { id: 0, left: "8%", top: "12%", size: 4, delay: "0s" },
  { id: 1, left: "22%", top: "35%", size: 3, delay: "0.5s" },
  { id: 2, left: "15%", top: "68%", size: 5, delay: "1s" },
  { id: 3, left: "35%", top: "18%", size: 4, delay: "1.5s" },
  { id: 4, left: "45%", top: "82%", size: 3, delay: "2s" },
  { id: 5, left: "55%", top: "25%", size: 5, delay: "2.5s" },
  { id: 6, left: "68%", top: "72%", size: 4, delay: "3s" },
  { id: 7, left: "75%", top: "42%", size: 3, delay: "3.5s" },
  { id: 8, left: "88%", top: "18%", size: 5, delay: "4s" },
  { id: 9, left: "92%", top: "58%", size: 4, delay: "4.5s" },
  { id: 10, left: "5%", top: "88%", size: 3, delay: "5s" },
  { id: 11, left: "28%", top: "52%", size: 4, delay: "5.5s" },
  { id: 12, left: "78%", top: "88%", size: 5, delay: "6s" },
  { id: 13, left: "42%", top: "8%", size: 3, delay: "6.5s" },
  { id: 14, left: "62%", top: "48%", size: 4, delay: "7s" },
];

// Light mode geometric decorations
const GEOMETRIC_SHAPES = [
  { id: 0, left: "3%", top: "15%", size: 40, rotation: 45, type: "triangle" as const },
  { id: 1, left: "92%", top: "25%", size: 35, rotation: 15, type: "diamond" as const },
  { id: 2, left: "8%", top: "75%", size: 30, rotation: 30, type: "triangle" as const },
  { id: 3, left: "88%", top: "70%", size: 45, rotation: 60, type: "diamond" as const },
  { id: 4, left: "50%", top: "5%", size: 25, rotation: 20, type: "circle" as const },
  { id: 5, left: "2%", top: "45%", size: 35, rotation: 75, type: "diamond" as const },
  { id: 6, left: "95%", top: "50%", size: 30, rotation: 35, type: "triangle" as const },
];

// AI text labels for background
const AI_LABELS = [
  { id: 0, left: "15%", top: "30%", text: "AI", opacity: 5 },
  { id: 1, left: "70%", top: "20%", text: "RabbitMQ", opacity: 4 },
  { id: 2, left: "25%", top: "65%", text: "Analytics", opacity: 3 },
  { id: 3, left: "80%", top: "55%", text: "Security", opacity: 4 },
  { id: 4, left: "55%", top: "75%", text: "Adaptive Learning", opacity: 3 },
  { id: 5, left: "10%", top: "80%", text: "Automation", opacity: 3 },
];

const renderShape = (shape: string, size: number, isDark: boolean) => {
  const baseClass = isDark ? "opacity-25 text-indigo-400" : "opacity-[0.2] text-blue-500";
  switch (shape) {
    case "circle":
      return (
        <div
          className={`rounded-full ${baseClass}`}
          style={{ width: size, height: size }}
        />
      );
    case "hexagon":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={baseClass}>
          <path
            fill="currentColor"
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            fillOpacity={isDark ? "0.25" : "0.25"}
          />
        </svg>
      );
    case "square":
      return (
        <div
          className={`rounded ${baseClass}`}
          style={{ width: size, height: size }}
        />
      );
    case "plus":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    default:
      return null;
  }
};

const renderGeometricShape = (type: string, size: number, rotation: number) => {
  const style = { width: size, height: size, transform: `rotate(${rotation}deg)` };
  switch (type) {
    case "triangle":
      return (
        <div style={style} className="absolute opacity-40">
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path fill="#3B82F6" d="M12 2L2 22h20L12 2z" fillOpacity="0.4" />
          </svg>
        </div>
      );
    case "diamond":
      return (
        <div style={style} className="absolute opacity-35">
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path fill="#8B5CF6" d="M12 2L2 12l10 10 10-10L12 2z" fillOpacity="0.35" />
          </svg>
        </div>
      );
    case "circle":
      return (
        <div
          style={{ ...style, background: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)", opacity: 0.25 }}
          className="absolute rounded-full"
        />
      );
    default:
      return null;
  }
};

const renderGeometricShapeDark = (type: string, size: number, rotation: number) => {
  const style = { width: size, height: size, transform: `rotate(${rotation}deg)` };
  switch (type) {
    case "triangle":
      return (
        <div style={style} className="absolute opacity-30">
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path fill="#818CF8" d="M12 2L2 22h20L12 2z" fillOpacity="0.3" />
          </svg>
        </div>
      );
    case "diamond":
      return (
        <div style={style} className="absolute opacity-25">
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path fill="#A78BFA" d="M12 2L2 12l10 10 10-10L12 2z" fillOpacity="0.25" />
          </svg>
        </div>
      );
    case "circle":
      return (
        <div
          style={{ ...style, background: "linear-gradient(135deg, #818CF8 0%, #A78BFA 100%)", opacity: 0.2 }}
          className="absolute rounded-full"
        />
      );
    default:
      return null;
  }
};

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  className = "",
  theme = "light",
}) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950"
          : "bg-gradient-to-br from-blue-50 via-indigo-50/50 to-violet-50/30"
      } ${className}`}
    >
      {/* Grid - More visible */}
      <div
        className={`absolute inset-0 ${
          isDark ? "opacity-[0.03]" : "opacity-[0.03]"
        }`}
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? "rgba(99, 102, 241, 0.5)" : "#3B82F6"} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? "rgba(99, 102, 241, 0.5)" : "#3B82F6"} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "grid-move 20s linear infinite",
        }}
      />

      {/* Radial Glow */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-radial from-indigo-900/20 via-transparent to-transparent"
            : "bg-gradient-radial from-blue-100/40 via-transparent to-transparent"
        }`}
      />

      {/* ====== LIGHT MODE EFFECTS ====== */}
      {/* Warm, sun-like, soft floating effects */}
      {!isDark && (
        <>
          {/* Soft Warm Glow Orbs */}
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-blue-300/50 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-300/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-violet-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] bg-cyan-300/35 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-10 left-10 w-[250px] h-[250px] bg-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />

          {/* Light Rays from sun */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={`ray-${i}`}
                className="absolute top-0 left-1/2 h-[600px] bg-gradient-to-b from-yellow-100/20 via-orange-100/10 to-transparent"
                style={{
                  width: "2px",
                  transform: `translateX(-50%) rotate(${-30 + i * 10}deg)`,
                  transformOrigin: "bottom center",
                  opacity: 0.4,
                }}
              />
            ))}
          </div>

          {/* Floating Soft Clouds */}
          <div className="absolute top-20 left-10 w-[200px] h-[80px] bg-white/40 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute top-40 right-20 w-[150px] h-[60px] bg-white/30 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-32 left-1/4 w-[180px] h-[70px] bg-white/35 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: "4s" }} />

          {/* Geometric Decorations - Soft shapes */}
          {GEOMETRIC_SHAPES.map((shape) => (
            <div
              key={`geo-${shape.id}`}
              className="absolute pointer-events-none"
              style={{ left: shape.left, top: shape.top, animation: `float ${15 + shape.id * 2}s ease-in-out infinite` }}
            >
              {renderGeometricShape(shape.type, shape.size, shape.rotation)}
            </div>
          ))}

          {/* Floating Particles/Sparkles - Warm glow */}
          {LIGHT_PARTICLES.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size + 2,
                height: particle.size + 2,
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                opacity: 0.6,
                animation: `sparkle ${3 + (particle.id % 3)}s ease-in-out infinite`,
                animationDelay: particle.delay,
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.4)",
              }}
            />
          ))}

          {/* Gradient Mesh Overlay */}
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="absolute top-0 left-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="mesh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <path d="M 0,0 Q 50,20 100,0 T 200,0 L 200,100 Q 150,80 100,100 T 0,100 Z" fill="url(#mesh-gradient)" />
            </svg>
          </div>

          {/* Floating Dots Pattern */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={`dot-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${5 + (i * 4.5)}%`,
                  top: `${10 + (i % 5) * 18}%`,
                  background: i % 2 === 0 ? "#3B82F6" : "#8B5CF6",
                  opacity: 0.3,
                  animation: `pulse-dot ${2 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: i % 3 === 0 ? "0 0 8px rgba(59, 130, 246, 0.6)" : "none",
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ====== DARK MODE EFFECTS ====== */}
      {/* Neon, cyberpunk, aurora, star-like effects */}
      {isDark && (
        <>
          {/* Neon Glow Orbs */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-violet-600/40 via-purple-600/30 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-cyan-600/40 via-blue-600/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-fuchsia-600/30 via-pink-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-gradient-to-tr from-indigo-600/35 via-blue-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-violet-500/10 to-transparent rounded-full blur-3xl" />

          {/* Aurora Effect - Multiple layers */}
          <div className="absolute top-0 left-0 w-full h-[40%] overflow-hidden">
            <div
              className="absolute w-[200%] h-full"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.15) 30%, rgba(59, 130, 246, 0.1) 60%, transparent 100%)",
                animation: "aurora 15s ease-in-out infinite",
                filter: "blur(30px)",
              }}
            />
            <div
              className="absolute w-[200%] h-full"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.12) 40%, rgba(99, 102, 241, 0.08) 70%, transparent 100%)",
                animation: "aurora 20s ease-in-out infinite reverse",
                animationDelay: "5s",
                filter: "blur(40px)",
              }}
            />
          </div>

          {/* Cyberpunk Grid - Enhanced */}
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grid-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="50%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
              <g stroke="url(#grid-glow)" strokeWidth="0.5">
                {[...Array(30)].map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={`${i * 3.5}%`} x2="100%" y2={`${i * 3.5}%`} />
                ))}
                {[...Array(30)].map((_, i) => (
                  <line key={`v-${i}`} x1={`${i * 3.5}%`} y1="0" x2={`${i * 3.5}%`} y2="100%" />
                ))}
              </g>
            </svg>
          </div>

          {/* Floating Neon Particles */}
          {LIGHT_PARTICLES.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size + 3,
                height: particle.size + 3,
                background: particle.id % 3 === 0
                  ? "linear-gradient(135deg, #F472B6, #EC4899)"
                  : particle.id % 3 === 1
                    ? "linear-gradient(135deg, #818CF8, #6366F1)"
                    : "linear-gradient(135deg, #22D3EE, #06B6D4)",
                opacity: 0.7,
                animation: `sparkle ${2 + (particle.id % 2)}s ease-in-out infinite`,
                animationDelay: particle.delay,
                boxShadow: particle.id % 3 === 0
                  ? "0 0 15px rgba(244, 114, 182, 0.9), 0 0 30px rgba(236, 72, 153, 0.5)"
                  : particle.id % 3 === 1
                    ? "0 0 15px rgba(129, 140, 248, 0.9), 0 0 30px rgba(99, 102, 241, 0.5)"
                    : "0 0 15px rgba(34, 211, 238, 0.9), 0 0 30px rgba(6, 182, 212, 0.5)",
              }}
            />
          ))}

          {/* Geometric Decorations - Neon style */}
          {GEOMETRIC_SHAPES.map((shape) => (
            <div
              key={`geo-${shape.id}`}
              className="absolute pointer-events-none"
              style={{ left: shape.left, top: shape.top, animation: `float ${12 + shape.id * 2}s ease-in-out infinite` }}
            >
              {renderGeometricShapeDark(shape.type, shape.size, shape.rotation)}
            </div>
          ))}

          {/* Neon Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(129, 140, 248, 0)" />
                <stop offset="50%" stopColor="rgba(129, 140, 248, 0.8)" />
                <stop offset="100%" stopColor="rgba(129, 140, 248, 0)" />
              </linearGradient>
            </defs>
            <path d="M 0 20 Q 30 80, 50 20 T 100 30" fill="none" stroke="url(#neon-gradient)" strokeWidth="1" className="animate-dash" />
            <path d="M 0 60 Q 40 20, 70 60 T 100 50" fill="none" stroke="url(#neon-gradient)" strokeWidth="0.5" className="animate-dash" style={{ animationDelay: "3s" }} />
            <path d="M 0 80 Q 20 50, 60 80 T 100 70" fill="none" stroke="url(#neon-gradient)" strokeWidth="0.5" className="animate-dash" style={{ animationDelay: "6s" }} />
          </svg>

          {/* Star-like dots with glow */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(25)].map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${3 + (i * 3.8)}%`,
                  top: `${5 + (i % 6) * 15}%`,
                  width: i % 4 === 0 ? 3 : 2,
                  height: i % 4 === 0 ? 3 : 2,
                  background: i % 3 === 0 ? "#F472B6" : i % 3 === 1 ? "#818CF8" : "#22D3EE",
                  opacity: 0.5,
                  animation: `twinkle ${1 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                  boxShadow: i % 5 === 0
                    ? `0 0 ${6 + (i % 4) * 2}px currentColor`
                    : "none",
                }}
              />
            ))}
          </div>

          {/* Floating Hexagons */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={`hex-${i}`}
                className="absolute"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${15 + (i % 3) * 30}%`,
                  animation: `hex-float ${8 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <svg width={20 + (i % 3) * 8} height={20 + (i % 3) * 8} viewBox="0 0 24 24" className="opacity-20" style={{ filter: "drop-shadow(0 0 5px rgba(129, 140, 248, 0.5))" }}>
                  <path fill="#818CF8" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fillOpacity="0.2" />
                </svg>
              </div>
            ))}
          </div>
        </>
      )}

      {/* AI Labels - Enhanced for both modes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {AI_LABELS.map((label) => (
          <div
            key={label.id}
            className={`absolute text-xs font-medium tracking-wider select-none ${
              isDark ? "text-indigo-400/50" : "text-blue-600/50"
            }`}
            style={{
              left: label.left,
              top: label.top,
              opacity: (label.opacity + 3) / 100,
              animation: `fade-pulse ${10 + label.id * 2}s ease-in-out infinite`,
              animationDelay: `${label.id * 1.5}s`,
            }}
          >
            {label.text}
          </div>
        ))}
      </div>

      {/* Floating Shapes - More visible */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {FLOATING_SHAPES.map((shape) => (
          <div
            key={shape.id}
            className="absolute"
            style={{
              left: shape.left,
              top: shape.top,
              animation: `float ${shape.duration} ease-in-out infinite`,
              animationDelay: shape.delay,
            }}
          >
            {renderShape(shape.shape, shape.size, isDark)}
          </div>
        ))}
      </div>

      {/* Data Lines (Dark only) */}
      {isDark && (
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0)" />
              <stop offset="50%" stopColor="rgba(99, 102, 241, 0.6)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
            </linearGradient>
          </defs>
          <path d="M 0 50 Q 25 30, 50 50 T 100 50" fill="none" stroke="url(#line-gradient)" strokeWidth="1" className="animate-dash" />
          <path d="M 0 30 Q 30 50, 60 30 T 100 40" fill="none" stroke="url(#line-gradient)" strokeWidth="0.5" className="animate-dash" style={{ animationDelay: "2s" }} />
          <path d="M 0 70 Q 40 50, 70 70 T 100 60" fill="none" stroke="url(#line-gradient)" strokeWidth="0.5" className="animate-dash" style={{ animationDelay: "4s" }} />
        </svg>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.15; }
          25% { transform: translateY(-20px) translateX(10px) rotate(5deg); opacity: 0.2; }
          50% { transform: translateY(-10px) translateX(-5px) rotate(-3deg); opacity: 0.15; }
          75% { transform: translateY(-25px) translateX(5px) rotate(3deg); opacity: 0.18; }
        }
        @keyframes fade-pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        @keyframes dash {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-dash {
          stroke-dasharray: 10 20;
          animation: dash 20s linear infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.5); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
        @keyframes aurora {
          0%, 100% { transform: translateX(-25%) rotate(-5deg); }
          50% { transform: translateX(0%) rotate(5deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes hex-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateX(0) translateY(0); }
          33% { transform: translateX(20px) translateY(-15px); }
          66% { transform: translateX(-10px) translateY(10px); }
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
