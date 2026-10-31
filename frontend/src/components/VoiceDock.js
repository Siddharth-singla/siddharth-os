import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, X, Send } from "lucide-react";
import { useOS } from "../os/context";
import { blip } from "../lib/audio";
import VoiceWave from "./VoiceWave";

export default function VoiceDock() {
  const { log, listening, interim, energy, startListening, runCommand, dockOpen, setDockOpen } = useOS();
  const [text, setText] = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log, interim]);

  const submit = (e) => {
    e.preventDefault();
    runCommand(text);
    setText("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[55] flex flex-col items-end gap-3">
      <AnimatePresence>
        {dockOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-[340px] max-w-[86vw] border border-ink/10 bg-panel/95 backdrop-blur-xl"
            data-testid="voice-dock-panel"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-2 font-monoos text-[10px] tracking-[0.25em] text-faint">
              <span>// VOICE CONSOLE</span>
              <button data-testid="voice-dock-close-button" onClick={() => setDockOpen(false)} aria-label="Close console">
                <X size={13} className="text-dim hover:text-ink" />
              </button>
            </div>
            <div ref={logRef} className="h-56 overflow-y-auto p-4 font-monoos text-xs space-y-2" data-testid="voice-dock-log">
              {log.length === 0 && !listening && <p className="text-faint">// say, type or dictate a command. try "help"</p>}
              {log.map((l) => (
                <p key={l.id} className={l.role === "user" ? "text-ink" : "text-osc"}>
                  {l.role === "user" ? "> " : ""}
                  {l.text}
                </p>
              ))}
              {listening && (
                <p className="text-ink/60 italic" data-testid="voice-dock-interim">
                  &gt; {interim || "listening…"}
                </p>
              )}
            </div>
            <VoiceWave active={listening} energy={energy} height={28} className="border-t border-ink/5" />
            <form onSubmit={submit} className="flex items-center gap-2 border-t border-ink/10 p-3">
              <button
                type="button"
                data-testid="voice-dock-mic-button"
                onClick={() => startListening()}
                aria-label={listening ? "Stop listening" : "Start voice input"}
                className={`h-9 w-9 shrink-0 flex items-center justify-center border transition-colors duration-300 ${
                  listening ? "border-osc bg-osc/20 text-osc animate-pulse" : "border-ink/15 text-dim hover:text-osc hover:border-osc/50"
                }`}
              >
                {listening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <input
                data-testid="voice-dock-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='"show me his open source"'
                aria-label="Command"
                className="min-w-0 flex-1 bg-transparent font-monoos text-xs text-ink placeholder:text-faint outline-none"
              />
              <button
                type="submit"
                data-testid="voice-dock-send-button"
                aria-label="Send command"
                className="h-9 w-9 shrink-0 flex items-center justify-center bg-osc/15 border border-osc/40 text-osc hover:bg-osc hover:text-void transition-colors duration-300"
              >
                <Send size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        data-testid="voice-dock-button"
        onClick={() => { blip(); setDockOpen(!dockOpen); }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-osc text-void shadow-[0_10px_30px_rgba(3,5,14,0.45)] hover:scale-105 active:scale-95 transition-transform duration-200"
        aria-label={dockOpen ? "Close voice console" : "Open voice console"}
      >
        <Mic size={18} />
      </button>
    </div>
  );
}
