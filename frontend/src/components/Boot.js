import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, CornerDownLeft } from "lucide-react";
import { bootChord, tick } from "../lib/audio";
import { useOS } from "../os/context";
import { VOICE_EXAMPLES } from "../lib/voice";
import { dictationHint, isTouch, speechSupported } from "../lib/platform";
import VoiceWave from "./VoiceWave";

const LINES = [
  "SIDDHARTH.OS v0.9.4",
  "(c) 2024—∞ SIDDHARTH SINGLA",
  "> boot sequence initiated",
  "> loading curiosity.sys .............. OK",
  "> mounting /code /oss /sports ......... OK",
  "> connecting nodes ................... OK",
  "> human.exe is currently running",
];

const EASE = [0.16, 1, 0.3, 1];

export default function Boot({ onEnter }) {
  const { listening, interim, energy, startListening } = useOS();
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const [hint, setHint] = useState("");
  const [canListen, setCanListen] = useState(false);
  const inputRef = useRef(null);
  const ready = count >= LINES.length;

  useEffect(() => {
    setHint(dictationHint());
    setCanListen(speechSupported());
  }, []);

  useEffect(() => {
    if (count < LINES.length) {
      const t = setTimeout(() => setCount((c) => c + 1), count === 0 ? 380 : 230);
      return () => clearTimeout(t);
    }
  }, [count]);

  // On desktop, put the cursor in the box so a Wispr Flow user can just hold the key and talk.
  useEffect(() => {
    if (ready && !isTouch()) {
      const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 700);
      return () => clearTimeout(t);
    }
  }, [ready]);

  const enter = (cmd) => {
    bootChord();
    onEnter(cmd);
  };

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    enter(t || undefined);
  };

  const stop = (e) => e.stopPropagation();

  return (
    <motion.div
      data-testid="boot-screen"
      className="fixed inset-0 z-[80] bg-void overflow-y-auto"
      exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
      onClick={() => setCount(LINES.length)}
    >
      <div className="min-h-full flex items-center justify-center px-5 py-12">
        <div className="w-full min-w-0 max-w-xl font-monoos text-xs sm:text-sm leading-7 text-dim">
          {LINES.slice(0, count).map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={i === LINES.length - 1 ? "text-osc mt-3" : i === 0 ? "text-ink font-bold tracking-widest" : ""}
            >
              {line}
            </motion.div>
          ))}
          {!ready && <span className="inline-block w-2 h-4 bg-osc animate-pulse" />}

          {ready && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
              className="mt-10"
              onClick={stop}
              data-testid="boot-voice"
            >
              <p className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink">
                Speak to explore.
              </p>
              <p className="mt-1 text-[11px] tracking-[0.15em] text-faint">
                ASK IT ANYTHING ABOUT SIDDHARTH. OUT LOUD, OR TYPED.
              </p>

              <form
                onSubmit={submit}
                className={`mt-5 border bg-panel/80 transition-colors duration-300 ${
                  listening ? "border-osc/70" : "border-white/15 focus-within:border-osc/50"
                }`}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="text-osc shrink-0">&gt;</span>
                  <input
                    ref={inputRef}
                    data-testid="boot-command-input"
                    value={listening && interim ? interim : text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder='"Tell me his story."'
                    aria-label="Ask SIDDHARTH.OS a question"
                    className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-ink placeholder:text-faint outline-none"
                  />
                  {canListen && (
                    <button
                      type="button"
                      data-testid="boot-mic-button"
                      onClick={() => startListening((said) => enter(said))}
                      aria-label={listening ? "Stop listening" : "Speak your question"}
                      className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-full border transition-colors duration-300 ${
                        listening ? "border-osc bg-osc/20 text-osc" : "border-white/20 text-dim hover:text-osc hover:border-osc/60"
                      }`}
                    >
                      {listening ? <MicOff size={15} /> : <Mic size={15} />}
                    </button>
                  )}
                  <button
                    type="submit"
                    aria-label="Run command"
                    className="h-9 w-9 shrink-0 flex items-center justify-center border border-osc/40 bg-osc/10 text-osc hover:bg-osc hover:text-void transition-colors duration-300"
                  >
                    <CornerDownLeft size={14} />
                  </button>
                </div>
                <VoiceWave active={listening} energy={energy} height={34} className="border-t border-white/5" />
              </form>
              <p className="mt-2 text-[10px] tracking-[0.12em] text-faint" data-testid="boot-dictation-hint">
                {listening ? "LISTENING…" : hint}
              </p>

              <div className="mt-6 flex flex-wrap gap-2" data-testid="boot-examples">
                {VOICE_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => enter(ex)}
                    onMouseEnter={() => tick()}
                    className="border border-white/10 px-3 py-1.5 text-[11px] text-dim hover:text-ink hover:border-osc/50 transition-colors duration-300"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  data-testid="boot-enter-button"
                  type="button"
                  onClick={() => enter()}
                  onMouseEnter={() => tick()}
                  className="border border-osc/60 bg-osc/10 px-8 py-3 text-xs tracking-[0.3em] text-osc hover:bg-osc hover:text-void transition-colors duration-300"
                >
                  ENTER SIDDHARTH.OS
                </button>
                <span className="text-[10px] tracking-widest text-faint">OR JUST LOOK AROUND</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
