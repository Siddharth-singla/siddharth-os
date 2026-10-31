import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, CornerDownLeft } from "lucide-react";
import { useOS } from "../os/context";
import { VOICE_EXAMPLES } from "../lib/voice";
import { blip, tick } from "../lib/audio";
import { dictationHint, speechSupported } from "../lib/platform";
import SectionHeader from "./SectionHeader";
import VoiceWave from "./VoiceWave";

const EASE = [0.16, 1, 0.3, 1];

export default function VoiceSection() {
  const { runCommand, startListening, listening, interim, energy, log } = useOS();
  const [text, setText] = useState("");
  const [supported, setSupported] = useState(false);
  const [hint, setHint] = useState("");
  const outRef = useRef(null);

  useEffect(() => {
    setSupported(speechSupported());
    setHint(dictationHint());
  }, []);

  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log, interim]);

  const submit = (e) => {
    e.preventDefault();
    runCommand(text);
    setText("");
  };

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
              Voice runs the system. Ask for a world, a project, a year, or a
              question about how something happened. It understands loose,
              spoken English, and some Hinglish too ("projects dikhao").
            </p>

            {supported && (
              <button
                data-testid="voice-section-mic-button"
                onClick={() => startListening()}
                onMouseEnter={() => tick()}
                className={`mt-10 group flex items-center gap-4 border px-6 py-4 font-monoos text-xs tracking-[0.3em] transition-all duration-300 ${
                  listening
                    ? "border-osc bg-osc/15 text-osc"
                    : "border-osc/50 text-osc hover:bg-osc hover:text-void"
                }`}
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
                {listening ? "LISTENING… TAP TO STOP" : "SPEAK TO EXPLORE"}
              </button>
            )}

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

            <div className="mt-12 max-w-md border-l border-osc/30 pl-4" data-testid="built-by-voice">
              <p className="font-monoos text-[10px] tracking-[0.3em] text-osc">// BUILT BY VOICE</p>
              <p className="mt-2 text-sm leading-relaxed text-dim">
                This site was built the same way you explore it: by talking. Every
                instruction behind it was spoken with Wispr Flow, first into
                Emergent, then to Kiro.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className={`border bg-panel/70 font-monoos text-xs transition-colors duration-300 ${listening ? "border-osc/50" : "border-white/10"}`}
            data-testid="voice-console"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[10px] tracking-[0.25em] text-faint">
              <span>/dev/voice — COMMAND CONSOLE</span>
              <span className={listening ? "text-osc" : "text-faint"}>{listening ? "● REC" : "● LIVE"}</span>
            </div>
            <div ref={outRef} className="h-64 overflow-y-auto p-4 space-y-2" data-testid="voice-console-output">
              {log.length === 0 && !listening && (
                <p className="text-faint">// console ready. try a command, or "help"</p>
              )}
              {log.map((l) => (
                <p key={l.id} className={l.role === "user" ? "text-ink" : "text-osc"}>
                  {l.role === "user" ? "> " : ""}
                  {l.text}
                </p>
              ))}
              {listening && <p className="text-ink/60 italic">&gt; {interim || "listening…"}</p>}
            </div>
            <VoiceWave active={listening} energy={energy} height={48} className="border-t border-white/5" />
            <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
              <span className="text-osc shrink-0">&gt;</span>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='"how did he get into AI?"'
                aria-label="Command"
                data-testid="voice-section-input"
                className="min-w-0 flex-1 bg-transparent text-xs text-ink placeholder:text-faint outline-none"
              />
              <button type="submit" aria-label="Run command" className="shrink-0 text-faint hover:text-osc transition-colors duration-300">
                <CornerDownLeft size={14} />
              </button>
            </form>
            <p className="border-t border-white/5 px-4 py-2 text-[10px] tracking-[0.1em] text-faint">{hint}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
