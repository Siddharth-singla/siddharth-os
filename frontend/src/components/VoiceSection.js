import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, CornerDownLeft } from "lucide-react";
import { useOS } from "../os/context";
import { VOICE_EXAMPLES } from "../lib/voice";
import { blip, tick } from "../lib/audio";
import SectionHeader from "./SectionHeader";

const EASE = [0.16, 1, 0.3, 1];

export default function VoiceSection() {
  const { runCommand, startListening, listening, log } = useOS();
  const supported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <section id="voice" className="relative py-28 sm:py-36" data-testid="voice-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader index="02" label="// VOICE INPUT" title="SPEAK TO EXPLORE" right={supported ? "MIC: READY" : "MIC: TEXT MODE"} />

        <div className="grid gap-12 lg:grid-cols-2 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="font-serif-human italic text-2xl sm:text-3xl lg:text-4xl leading-snug text-ink/90">
              Most portfolios tell you what someone has done.
              <span className="text-osc"> This one lets you talk to it.</span>
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-dim">
              Voice runs the system — navigate worlds, filter projects, open
              stories. Say it out loud, or type it. The interface listens.
            </p>

            <button
              data-testid="voice-section-mic-button"
              onClick={startListening}
              onMouseEnter={() => tick()}
              className={`mt-10 group flex items-center gap-4 border px-6 py-4 font-monoos text-xs tracking-[0.3em] transition-all duration-300 ${
                listening
                  ? "border-osc bg-osc/15 text-osc"
                  : "border-osc/50 text-osc hover:bg-osc hover:text-void"
              }`}
            >
              <span className={`relative flex h-3 w-3 items-center justify-center ${listening ? "animate-pulse" : ""}`}>
                <Mic size={16} />
              </span>
              {listening ? "LISTENING..." : "SPEAK TO EXPLORE"}
            </button>

            <div className="mt-8 flex flex-wrap gap-2" data-testid="voice-example-chips">
              {VOICE_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  data-testid={`voice-chip-${ex.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  onClick={() => { blip(); runCommand(ex); }}
                  onMouseEnter={() => tick()}
                  className="border border-white/10 bg-panel/60 px-3 py-2 font-monoos text-[11px] text-dim hover:text-ink hover:border-osc/50 transition-colors duration-300"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="border border-white/10 bg-panel/70 font-monoos text-xs"
            data-testid="voice-console"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[10px] tracking-[0.25em] text-faint">
              <span>/dev/voice — COMMAND CONSOLE</span>
              <span className="text-osc">● LIVE</span>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-2" data-testid="voice-console-output">
              {log.length === 0 && (
                <p className="text-faint">// console ready — try a command</p>
              )}
              {log.map((l) => (
                <p key={l.id} className={l.role === "user" ? "text-ink" : "text-osc"}>
                  {l.role === "user" ? "> " : ""}
                  {l.text}
                </p>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
              <CornerDownLeft size={13} className="text-faint shrink-0" />
              <span className="text-faint text-[10px] tracking-widest">
                TRY: "SHOW ME HIS OPEN SOURCE"
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
