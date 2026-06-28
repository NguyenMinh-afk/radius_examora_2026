import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, Info } from "lucide-react";

const VideoDemoSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = clickPosition * videoRef.current.duration;
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  return (
    <section className="px-6 py-24 bg-gradient-to-b from-[#F8FAFC] to-white">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
              See It In Action
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Watch how EXMORA works
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Get a comprehensive overview of our AI-powered examination platform in this 3-minute demo.
          </p>
        </div>

        {/* Video Player */}
        <div
          ref={containerRef}
          className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl aspect-video group"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Placeholder Video Area */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            {/* Play/Pause Overlay */}
            <button
              onClick={togglePlay}
              className={`relative z-10 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 ${
                !isPlaying ? "scale-100" : "scale-0"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>

            {/* Platform Preview Mockup */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-3/4 h-3/4 border-2 border-white/20 rounded-xl flex items-center justify-center">
                <div className="text-center text-white/50">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8" />
                  </div>
                  <p className="font-medium">EXMORA Platform Demo</p>
                  <p className="text-sm">Duration: 3:24</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Overlay */}
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 transition-all duration-300 ${
              showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Progress Bar */}
            <div
              className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer group/progress"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-blue-500 rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                {/* Skip */}
                <button
                  onClick={() => handleSkip(10)}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Mute */}
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {/* Time */}
                <span className="text-white/70 text-sm">
                  {Math.floor(progress * 1.82 / 60)}:{String(Math.floor((progress * 1.82) % 60)).padStart(2, "0")} / 3:24
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Info */}
                <button
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                  title="Video info"
                >
                  <Info className="w-4 h-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hidden video element for actual video playback */}
          <video
            ref={videoRef}
            className="hidden"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          >
            <source src="/demo.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Video Features */}
        <div className="grid grid-cols-3 gap-6 mt-10">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">3 min</div>
            <div className="text-sm text-gray-500">Quick overview</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">720p</div>
            <div className="text-sm text-gray-500">HD quality</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">CC</div>
            <div className="text-sm text-gray-500">Subtitles available</div>
          </div>
        </div>

        {/* Schedule Demo CTA */}
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <p className="text-gray-700 mb-4">
            Prefer a personalized walkthrough with our team?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Schedule a Live Demo
          </a>
        </div>
      </div>
    </section>
  );
};

export default VideoDemoSection;
