import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { bootChord, tick } from "../lib/audio";

const LINES = [
  "SIDDHARTH.OS v0.9.4",
  "(c) 2024—∞ SIDDHARTH SINGLA",
  "> boot sequence initiated",
  "> loading curiosity.sys .............. OK",
  "> mounting /code /oss /sports ......... OK",
  "> connecting nodes ................... OK",
  "> human.exe is currently running",
];

export default function Boot({ onEnter }) {
  const [count, setCount] = useState(0);
  const ready = count >= LINES.length;

  useEffect(() => {
    if (count < LINES.length) {
      const t = setTimeout(() => setCount((c) => c + 1), count === 0 ? 380 : 230);
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <motion.div
      data-testid="boot-screen"
      className="fixed inset-0 z-[80] bg-void flex items-center justify-center px-6 cursor-pointer"
      exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
      onClick={() => setCount(LINES.length)}
    >
      <div className="w-full max-w-xl font-monoos text-xs sm:text-sm leading-7 text-dim">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-8 flex items-center gap-4"
          >
            <button
              data-testid="boot-enter-button"
              onClick={(e) => {
                e.stopPropagation();
                bootChord();
                onEnter();
              }}
              onMouseEnter={() => tick()}
              className="group border border-osc/60 bg-osc/10 px-8 py-3 font-monoos text-xs tracking-[0.3em] text-osc hover:bg-osc hover:text-void transition-colors duration-300"
            >
              ENTER SYSTEM
            </button>
            <span className="font-monoos text-[10px] tracking-widest text-faint">
              OR CLICK ANYWHERE
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
