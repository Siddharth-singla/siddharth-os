import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import OSContext from "./os/context";
import { matchCommand } from "./lib/voice";
import { PROJECTS } from "./data/content";
import { blip, setMuted as setAudioMuted, whoosh } from "./lib/audio";
import ParticleField from "./components/ParticleField";
import Boot from "./components/Boot";
import SystemBar from "./components/SystemBar";
import Hero from "./components/Hero";
import About from "./components/About";
import TechMarquee from "./components/TechMarquee";
import WorldMap from "./components/WorldMap";
import VoiceSection from "./components/VoiceSection";
import VoiceDock from "./components/VoiceDock";
import BuildWorld from "./components/worlds/Build";
import Source from "./components/worlds/Source";
import Lab from "./components/worlds/Lab";
import Play from "./components/worlds/Play";
import Mind from "./components/worlds/Mind";
import Timeline from "./components/worlds/Timeline";
import Future from "./components/worlds/Future";

function Over({ children }) {
  return (
    <div className="relative rounded-t-[2rem] sm:rounded-t-[3rem] -mt-7 sm:-mt-12 bg-void/95 border-t border-white/[0.07] shadow-[0_-28px_70px_rgba(0,0,0,0.5)]">
      {children}
    </div>
  );
}

function App() {
  const [booted, setBooted] = useState(false);
  const [wipe, setWipe] = useState(null);
  const [muted, setMutedState] = useState(false);
  const [listening, setListening] = useState(false);
  const [log, setLog] = useState([]);
  const [dockOpen, setDockOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState(null);
  const lenisRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    let rafId = 0;
    const raf = (t) => {
      lenis.raf(t);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    setAudioMuted(muted);
  }, [muted]);

  useEffect(() => {
    document.body.style.overflow = booted ? "" : "hidden";
    lenisRef.current?.[booted ? "start" : "stop"]();
    if (booted) window.scrollTo(0, 0);
  }, [booted]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.3 });
    else el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const navigate = useCallback(
    (sectionId, label) => {
      whoosh();
      setWipe(label || "WORLD");
      setTimeout(() => scrollTo(sectionId), 620);
      setTimeout(() => setWipe(null), 1250);
    },
    [scrollTo]
  );

  const pushLog = useCallback((role, text) => {
    setLog((l) => [...l.slice(-40), { role, text, id: Date.now() + Math.random() }]);
  }, []);

  const runCommand = useCallback(
    (text) => {
      const t = (text || "").trim();
      if (!t) return;
      setDockOpen(true);
      pushLog("user", t);
      const cmd = matchCommand(t, PROJECTS);
      cmd.reply.forEach((line, i) =>
        setTimeout(() => pushLog("system", line), 350 + i * 280)
      );
      if (cmd.filter) setProjectFilter(cmd.filter);
      if (cmd.section)
        setTimeout(() => navigate(cmd.section, cmd.label), 900 + cmd.reply.length * 280);
    },
    [navigate, pushLog]
  );

  const startListening = useCallback(() => {
    blip();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setDockOpen(true);
      pushLog("system", "MIC UNAVAILABLE IN THIS BROWSER — TYPE YOUR COMMAND INSTEAD.");
      return;
    }
    if (recRef.current) {
      try { recRef.current.abort(); } catch (e) { /* noop */ }
      recRef.current = null;
    }
    try {
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onstart = () => {
        setListening(true);
        setDockOpen(true);
        pushLog("system", "LISTENING...");
      };
      rec.onresult = (e) => {
        const said = e.results[0][0].transcript;
        setListening(false);
        runCommand(said);
      };
      rec.onerror = (e) => {
        setListening(false);
        setDockOpen(true);
        pushLog(
          "system",
          e.error === "not-allowed"
            ? "MIC PERMISSION DENIED — TYPE YOUR COMMAND INSTEAD."
            : "MIC ERROR — TYPE YOUR COMMAND INSTEAD."
        );
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
    } catch (err) {
      setListening(false);
      pushLog("system", "MIC UNAVAILABLE — TYPE YOUR COMMAND INSTEAD.");
    }
  }, [pushLog, runCommand]);

  const value = {
    navigate,
    scrollTo,
    muted,
    toggleMute: () => setMutedState((m) => !m),
    listening,
    startListening,
    log,
    runCommand,
    projectFilter,
    setProjectFilter,
    dockOpen,
    setDockOpen,
  };

  return (
    <OSContext.Provider value={value}>
      <ParticleField />
      <div className="fixed inset-0 z-0 fine-grid pointer-events-none" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />

      <SystemBar />

      <main className="relative z-10">
        <Hero booted={booted} />
        <Over><About /></Over>
        <Over><TechMarquee /></Over>
        <Over><WorldMap /></Over>
        <Over><VoiceSection /></Over>
        <Over><BuildWorld /></Over>
        <Over><Source /></Over>
        <Over><Lab /></Over>
        <Over><Play /></Over>
        <Over><Mind /></Over>
        <Over><Timeline /></Over>
        <Over><Future /></Over>
      </main>

      <VoiceDock />

      <AnimatePresence>
        {wipe && (
          <motion.div
            key="wipe"
            data-testid="world-transition-overlay"
            className="fixed inset-0 z-[60] bg-void flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="font-monoos text-xs sm:text-sm tracking-[0.35em] text-osc">
              LOADING {wipe}
            </div>
            <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 h-px w-48 bg-white/10 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
                className="h-full w-full bg-osc"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!booted && <Boot key="boot" onEnter={() => setBooted(true)} />}
      </AnimatePresence>
    </OSContext.Provider>
  );
}

export default App;
