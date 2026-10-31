import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, X, Send } from "lucide-react";
import { useOS } from "../os/context";
import { blip } from "../lib/audio";

export default function VoiceDock() {
  const { log, listening, startListening, runCommand, dockOpen, setDockOpen } = useOS();
  const [text, setText] = useState("");

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
            className="w-[340px] max-w-[86vw] border border-white/10 bg-panel/95 backdrop-blur-xl"
            data-testid="voice-dock-panel"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-monoos text-[10px] tracking-[0.25em] text-faint">
              <span>// VOICE CONSOLE</span>
              <button data-testid="voice-dock-close-button" onClick={() => setDockOpen(false)} aria-label="Close console">
                <X size={13} className="text-dim hover:text-ink" />
              </button>
            </div>
            <div className="h-56 overflow-y-auto p-4 font-monoos text-xs space-y-2" data-testid="voice-dock-log">
              {log.length === 0 && <p className="text-faint">// say or type a command</p>}
              {log.map((l) => (
                <p key={l.id} className={l.role === "user" ? "text-ink" : "text-osc"}>
                  {l.role === "user" ? "> " : ""}
                  {l.text}
                </p>
              ))}
            </div>
            <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 p-3">
              <button
                type="button"
                data-testid="voice-dock-mic-button"
                onClick={startListening}
                aria-label="Start voice input"
                className={`h-9 w-9 shrink-0 flex items-center justify-center border transition-colors duration-300 ${
                  listening ? "border-osc bg-osc/20 text-osc animate-pulse" : "border-white/15 text-dim hover:text-osc hover:border-osc/50"
                }`}
              >
                {listening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <input
                data-testid="voice-dock-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='type: "show me his open source"'
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
        className="flex h-12 w-12 items-center justify-center rounded-full bg-osc text-void shadow-[0_0_28px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 transition-transform duration-200"
        aria-label={dockOpen ? "Close voice console" : "Open voice console"}
      >
        <Mic size={18} />
      </button>
    </div>
  );
}
