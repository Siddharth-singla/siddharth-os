import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useOS } from "../os/context";
import { CHAPTERS } from "../data/content";
import { tick } from "../lib/audio";

export default function SystemBar() {
  const { muted, toggleMute, listening, startListening } = useOS();
  const [time, setTime] = useState("--:--:--");
  const [chapter, setChapter] = useState("");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-GB"));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      let cur = "";
      for (const c of CHAPTERS) {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= 90) cur = c.label;
      }
      setChapter(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50" data-testid="system-bar">
      <div className="backdrop-blur-md bg-void/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between font-monoos text-[11px] tracking-[0.2em]">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" className="h-5 w-5" alt="SIDDHARTH.OS mark" />
            <span className="text-ink font-bold">SIDDHARTH.OS</span>
            <span className="hidden sm:inline text-osc" data-testid="system-online-badge">
              ● ONLINE
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-5 text-dim">
            <span data-testid="current-chapter">{chapter}</span>
            <span data-testid="system-clock">{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="mic-toggle-button"
              onClick={startListening}
              onMouseEnter={() => tick()}
              className={`flex items-center gap-2 border px-3 py-1.5 transition-colors duration-300 ${
                listening
                  ? "border-osc bg-osc/15 text-osc"
                  : "border-white/15 text-dim hover:text-ink hover:border-osc/50"
              }`}
            >
              {listening ? <MicOff size={13} /> : <Mic size={13} />}
              <span className="hidden sm:inline">{listening ? "LISTENING" : "SPEAK"}</span>
            </button>
            <button
              data-testid="sound-toggle-button"
              onClick={toggleMute}
              className="flex items-center gap-2 border border-white/15 px-3 py-1.5 text-dim hover:text-ink hover:border-osc/50 transition-colors duration-300"
              aria-label={muted ? "Unmute interface sounds" : "Mute interface sounds"}
            >
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>
        </div>
      </div>
      <motion.div
        style={{ scaleX: progress }}
        className="h-[2px] origin-left bg-osc/80"
        data-testid="scroll-progress-bar"
      />
    </header>
  );
}
