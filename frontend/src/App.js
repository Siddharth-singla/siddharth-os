import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import OSContext from "./os/context";
import { matchCommand } from "./lib/voice";
import { PROJECTS, TECHS, OSS } from "./data/content";
import {
  blip, errorTone, listenStart, listenStop, playMotif, replyChime,
  setMuted as setAudioMuted, whoosh, worldNote,
} from "./lib/audio";
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

const OSS_COUNTS = (() => {
  const prs = OSS.flatMap((r) => r.prs);
  const merged = prs.filter((p) => p.state === "MERGED").length;
  return { merged, open: prs.length - merged };
})();

// Phrases that only ask the closing question, rather than suggesting an idea.
const GENERIC_IDEA = /^(what|so what|tell me what)?\s*(should|can|could)\s+(i|he|you|siddharth)\s+build( next)?\??$/i;

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
  const [interim, setInterim] = useState("");
  const [energy, setEnergy] = useState(0);
  const [log, setLog] = useState([]);
  const [dockOpen, setDockOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState(null);
  const [idea, setIdea] = useState("");
  const [operator, setOperator] = useState(false);
  const lenisRef = useRef(null);
  const recRef = useRef(null);
  const startedAt = useRef(Date.now());

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
    if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.3, offset: -64 });
    else el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const navigate = useCallback(
    (sectionId, label) => {
      whoosh();
      worldNote(sectionId);
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
      const cmd = matchCommand(t, PROJECTS, { techCount: TECHS.length, oss: OSS_COUNTS });
      let reply = cmd.reply;

      if (cmd.kind === "whoami") {
        const mins = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
        reply = [`guest${operator ? " (operator)" : ""}.`, `YOU'VE BEEN HERE ${mins} MINUTE${mins === 1 ? "" : "S"}.`];
      }
      if (cmd.kind === "mute") setMutedState(true);
      if (cmd.kind === "unmute") setMutedState(false);
      if (cmd.kind === "sound") {
        setMutedState(false);
        setAudioMuted(false);
        setTimeout(playMotif, 300);
      }
      if (cmd.kind === "sudo" && /access granted/i.test(reply.join(" "))) setOperator(true);
      if (cmd.kind === "idea" && !GENERIC_IDEA.test(t)) setIdea(t);

      if (cmd.kind === "unknown") setTimeout(errorTone, 300);
      else if (cmd.kind !== "sound") setTimeout(replyChime, 300);

      reply.forEach((line, i) => setTimeout(() => pushLog("system", line), 350 + i * 280));
      if (cmd.filter) setProjectFilter(cmd.filter);
      if (cmd.section) {
        // A filter lands on the project cards; a named project lands on its own card.
        const target = !cmd.filter
          ? cmd.section
          : cmd.filter.startsWith("project:")
          ? `module-${cmd.filter.slice(8).toLowerCase()}`
          : "modules";
        setTimeout(() => navigate(target, cmd.label), 900 + reply.length * 280);
      }
    },
    [navigate, pushLog, operator]
  );

  const stopListening = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch (e) { /* noop */ }
    }
  }, []);

  // onFinal: optional handler for the final transcript. Defaults to running it as a command.
  const startListening = useCallback(
    (onFinal) => {
      if (listening) {
        stopListening();
        return;
      }
      blip();
      const handle = typeof onFinal === "function" ? onFinal : runCommand;
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        setDockOpen(true);
        pushLog("system", "THIS BROWSER CAN'T LISTEN. TYPE OR DICTATE INTO THE BOX INSTEAD.");
        return;
      }
      if (recRef.current) {
        try { recRef.current.abort(); } catch (e) { /* noop */ }
        recRef.current = null;
      }
      let done = false;
      let lastHeard = "";
      const finish = (said) => {
        if (done) return;
        done = true;
        setInterim("");
        const s = (said || "").trim();
        if (s) handle(s);
      };
      try {
        const rec = new SR();
        rec.lang = "en-IN";
        rec.interimResults = true;
        rec.continuous = false;
        rec.maxAlternatives = 1;
        rec.onstart = () => {
          listenStart();
          setListening(true);
          setInterim("");
          if (handle === runCommand) setDockOpen(true);
        };
        rec.onspeechstart = () => setEnergy((e) => e + 1);
        rec.onresult = (e) => {
          let text = "";
          let final = false;
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
            if (e.results[i].isFinal) final = true;
          }
          lastHeard = text;
          setInterim(text);
          setEnergy((n) => n + 1);
          if (final) finish(text);
        };
        rec.onerror = (e) => {
          setListening(false);
          setInterim("");
          if (e.error === "aborted") return;
          setDockOpen(true);
          errorTone();
          pushLog(
            "system",
            e.error === "not-allowed" || e.error === "service-not-allowed"
              ? "MIC PERMISSION DENIED. TYPE OR DICTATE INTO THE BOX INSTEAD."
              : e.error === "no-speech"
              ? "DIDN'T CATCH THAT. TRY AGAIN, OR TYPE IT."
              : "MIC ERROR. TYPE OR DICTATE INTO THE BOX INSTEAD."
          );
          done = true;
        };
        rec.onend = () => {
          setListening(false);
          listenStop();
          // Some browsers end without marking a result final; use what we heard.
          finish(lastHeard);
          recRef.current = null;
        };
        recRef.current = rec;
        rec.start();
      } catch (err) {
        setListening(false);
        pushLog("system", "MIC UNAVAILABLE. TYPE OR DICTATE INTO THE BOX INSTEAD.");
      }
    },
    [listening, pushLog, runCommand, stopListening]
  );

  const enterSystem = useCallback(
    (cmd) => {
      setBooted(true);
      if (cmd) setTimeout(() => runCommand(cmd), 1100);
    },
    [runCommand]
  );

  const value = {
    navigate,
    scrollTo,
    muted,
    toggleMute: () => setMutedState((m) => !m),
    listening,
    interim,
    energy,
    startListening,
    stopListening,
    log,
    runCommand,
    projectFilter,
    setProjectFilter,
    dockOpen,
    setDockOpen,
    idea,
    setIdea,
    operator,
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

      <div className="sr-only" aria-live="polite" data-testid="voice-live-region">
        {log.length ? log[log.length - 1].text : ""}
      </div>

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
        {!booted && <Boot key="boot" onEnter={enterSystem} />}
      </AnimatePresence>
    </OSContext.Provider>
  );
}

export default App;
