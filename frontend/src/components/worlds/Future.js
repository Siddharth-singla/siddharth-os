import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Mic, Copy, Check } from "lucide-react";
import { FUTURE_ITEMS, CHECKLIST, GITHUB_URL, EMAIL, LINKEDIN_URL } from "../../data/content";
import { useOS } from "../../os/context";
import { blip, tick } from "../../lib/audio";
import SectionHeader from "../SectionHeader";

const EASE = [0.16, 1, 0.3, 1];

export default function Future() {
  const { startListening, listening } = useOS();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    blip();
    let ok = false;
    try {
      await navigator.clipboard.writeText(EMAIL);
      ok = true;
    } catch (e) {
      try {
        const ta = document.createElement("textarea");
        ta.value = EMAIL;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (err) {
        ok = false;
      }
    }
    setCopied(ok);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
      <section id="future" className="relative py-28 sm:py-36" data-testid="future-world">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader index="10" label="// WORLD: FUTURE" title="WHAT'S NEXT?" right="WORLD 5/5" />

          <div className="border-t border-white/10" data-testid="future-list">
            {FUTURE_ITEMS.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, ease: EASE, delay: i * 0.05 }}
                onMouseEnter={() => tick()}
                className="group flex items-center gap-6 border-b border-white/10 py-5 sm:py-6 hover:bg-white/[0.02] transition-colors duration-300"
              >
                <span className="font-monoos text-[10px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-display font-bold text-2xl sm:text-4xl tracking-tight text-ink group-hover:text-osc group-hover:translate-x-2 transition-all duration-300">
                  {item}
                </span>
                <ArrowUpRight size={20} className="text-faint group-hover:text-osc transition-colors duration-300" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-osc/30 bg-osc/[0.05] p-8 sm:p-10"
            data-testid="future-status-block"
          >
            <div>
              <p className="font-monoos text-[10px] tracking-[0.35em] text-dim">// SYSTEM STATUS</p>
              <p className="mt-2 font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-osc flex items-center gap-4">
                <span className="pulse-dot h-3 w-3 rounded-full bg-osc" />
                BUILDING.
              </p>
            </div>
            <p className="max-w-xs font-monoos text-[10px] leading-relaxed tracking-[0.2em] text-faint">
              COMPILATION OF SELF STILL IN PROGRESS. NO ERRORS, ONLY LESSONS.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="final" className="relative min-h-screen flex flex-col items-center justify-center text-center py-32 px-4" data-testid="final-screen">
        <div className="w-full max-w-3xl flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="font-monoos text-[11px] tracking-[0.4em] text-dim"
          >
            SIDDHARTH.OS
          </motion.p>

          <div className="mt-10 w-full max-w-xs space-y-2 font-monoos text-[11px] sm:text-xs" data-testid="final-checklist">
            {CHECKLIST.map(([name, state], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, ease: EASE, delay: i * 0.09 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-dim tracking-[0.25em]">{name}</span>
                <span className="flex-1 border-b border-dotted border-white/15" />
                {state === "OK" ? (
                  <span className="text-osc">✓</span>
                ) : (
                  <span className="text-warn load-dots">LOADING</span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="mt-16 font-serif-human italic text-3xl sm:text-5xl leading-snug text-ink"
            data-testid="final-quote"
          >
            The portfolio isn't finished
            <br />
            because I am not finished.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
            className="mt-16 flex flex-col items-center gap-5"
          >
            <p className="font-monoos text-[10px] tracking-[0.35em] text-osc">WHAT SHOULD I BUILD NEXT?</p>
            <button
              data-testid="final-idea-mic-button"
              onClick={startListening}
              onMouseEnter={() => tick()}
              className={`flex items-center gap-3 border px-6 py-3.5 font-monoos text-[11px] tracking-[0.3em] transition-all duration-300 ${
                listening
                  ? "border-osc bg-osc/15 text-osc animate-pulse"
                  : "border-osc/50 text-osc hover:bg-osc hover:text-void"
              }`}
            >
              <Mic size={15} />
              {listening ? "LISTENING..." : "SPEAK YOUR ANSWER"}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
            className="mt-16 w-full max-w-xl border border-white/10 bg-panel/60 text-left"
            data-testid="reach-me-panel"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5 font-monoos text-[10px] tracking-[0.3em] text-faint">
              <span>// REACH ME</span>
              <span className="text-osc">● ONLINE</span>
            </div>
            <div className="divide-y divide-white/5">
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="w-20 shrink-0 font-monoos text-[10px] tracking-[0.25em] text-faint">EMAIL</span>
                <span className="min-w-0 flex-1 truncate font-monoos text-[11px] sm:text-xs text-ink" data-testid="reach-email-value">
                  {EMAIL}
                </span>
                <button
                  data-testid="copy-email-button"
                  onClick={copyEmail}
                  onMouseEnter={() => tick()}
                  className={`flex shrink-0 items-center gap-1.5 border px-3 py-1.5 font-monoos text-[9px] tracking-[0.2em] transition-colors duration-300 ${
                    copied
                      ? "border-osc bg-osc/15 text-osc"
                      : "border-white/15 text-dim hover:text-osc hover:border-osc/60"
                  }`}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  <span data-testid="copy-email-feedback">{copied ? "COPIED ✓" : "COPY"}</span>
                </button>
              </div>
              <a
                data-testid="reach-github-link"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => tick()}
                className="group flex items-center gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors duration-300"
              >
                <span className="w-20 shrink-0 font-monoos text-[10px] tracking-[0.25em] text-faint">GITHUB</span>
                <span className="min-w-0 flex-1 truncate font-monoos text-[11px] sm:text-xs text-ink group-hover:text-osc transition-colors duration-300">
                  github.com/Siddharth-singla
                </span>
                <ArrowUpRight size={13} className="shrink-0 text-faint group-hover:text-osc transition-colors duration-300" />
              </a>
              <a
                data-testid="reach-linkedin-link"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => tick()}
                className="group flex items-center gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors duration-300"
              >
                <span className="w-20 shrink-0 font-monoos text-[10px] tracking-[0.25em] text-faint">LINKEDIN</span>
                <span className="min-w-0 flex-1 truncate font-monoos text-[11px] sm:text-xs text-ink group-hover:text-osc transition-colors duration-300">
                  /in/siddharth-singla200622
                </span>
                <ArrowUpRight size={13} className="shrink-0 text-faint group-hover:text-osc transition-colors duration-300" />
              </a>
            </div>
          </motion.div>
        </div>

        <footer className="mt-24 w-full border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-3 font-monoos text-[10px] tracking-[0.25em]">
              <a
                data-testid="footer-github-link"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => tick()}
                className="border border-white/15 px-4 py-2 text-dim hover:text-osc hover:border-osc/60 transition-colors duration-300"
              >
                GITHUB ↗
              </a>
              <a
                data-testid="footer-email-link"
                href={`mailto:${EMAIL}`}
                onMouseEnter={() => tick()}
                className="border border-white/15 px-4 py-2 text-dim hover:text-osc hover:border-osc/60 transition-colors duration-300"
              >
                {EMAIL} ↗
              </a>
              {LINKEDIN_URL && (
                <a
                  data-testid="footer-linkedin-link"
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => tick()}
                  className="border border-white/15 px-4 py-2 text-dim hover:text-osc hover:border-osc/60 transition-colors duration-300"
                >
                  LINKEDIN ↗
                </a>
              )}
            </div>
            <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-2 font-monoos text-[9px] tracking-[0.3em] text-faint" data-testid="site-footer">
              <span>SIDDHARTH.OS — 2024 → ∞</span>
              <span>AN INTERACTIVE AUTOBIOGRAPHY</span>
              <span>BUILT WITH CURIOSITY</span>
            </div>
          </div>
        </footer>
      </section>
    </>
  );
}
