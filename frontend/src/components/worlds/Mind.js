import { motion } from "framer-motion";
import { MIND_LINKS, MIND_QUOTE } from "../../data/content";
import { blip, tick } from "../../lib/audio";
import SectionHeader from "../SectionHeader";

const EASE = [0.16, 1, 0.3, 1];

export default function Mind() {
  return (
    <section id="mind" className="relative py-28 sm:py-36" data-testid="mind-world">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader index="08" label="// WORLD: MIND" title="EVERYTHING IS CONNECTED" right="WORLD 3/5" />

        <div className="flex flex-col gap-10" data-testid="mind-links">
          {MIND_LINKS.map((link, li) => (
            <motion.div
              key={link.join("→")}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: li * 0.08 }}
              onMouseEnter={() => tick()}
              onClick={() => blip()}
              className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 border border-white/10 bg-panel/40 p-5 sm:p-6 hover:border-osc/40 transition-colors duration-300"
              data-testid={`mind-link-${link.join("-").toLowerCase().replace(/[^a-z]+/g, "-")}`}
            >
              {link.map((node, ni) => (
                <div key={node} className="flex items-center gap-3 sm:flex-1">
                  <span
                    className={`border px-3 py-1.5 font-monoos text-[11px] tracking-[0.15em] transition-colors duration-300 ${
                      ni === 0
                        ? "border-osc/50 text-osc"
                        : "border-white/15 text-ink group-hover:border-osc/40"
                    }`}
                  >
                    {node}
                  </span>
                  {ni < link.length - 1 && (
                    <span className="hidden sm:block h-px flex-1 bg-gradient-to-r from-osc/50 via-white/10 to-white/10 group-hover:from-osc transition-colors duration-300" />
                  )}
                  {ni < link.length - 1 && (
                    <span className="sm:hidden font-monoos text-osc">↓</span>
                  )}
                  {ni === link.length - 1 && <span className="hidden sm:block" />}
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          {MIND_QUOTE.map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.25 }}
              className={`font-serif-human italic text-2xl sm:text-4xl leading-snug ${i === MIND_QUOTE.length - 1 ? "text-osc" : "text-ink/85"}`}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
