import { motion } from "framer-motion";
import { PLAYS, PLAY_QUOTE } from "../../data/content";
import { useOS } from "../../os/context";
import { blip, tick } from "../../lib/audio";
import SectionHeader from "../SectionHeader";

const EASE = [0.16, 1, 0.3, 1];

export default function Play() {
  const { navigate } = useOS();

  return (
    <section id="play" className="relative py-28 sm:py-36" data-testid="play-world">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader index="07" label="// WORLD: PLAY" title="A FOOTBALL MATCH CALLED ENGINEERING" right="WORLD 2/5" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="grid grid-cols-3 border border-white/10 bg-panel/60"
          data-testid="play-scoreboard"
        >
          <div className="flex flex-col items-center justify-center gap-1 p-6 sm:p-8 border-r border-white/10">
            <span className="font-monoos text-[10px] tracking-[0.3em] text-faint">HOME</span>
            <span className="font-display font-bold text-lg sm:text-2xl text-ink">ENGINEERING</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 p-6 sm:p-8">
            <span className="font-monoos text-[10px] tracking-[0.3em] text-faint">MATCH CLOCK</span>
            <span className="font-monoos font-bold text-3xl sm:text-5xl text-osc" data-testid="play-match-clock">
              90<span className="animate-pulse">:</span>00
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 p-6 sm:p-8 border-l border-white/10">
            <span className="font-monoos text-[10px] tracking-[0.3em] text-faint">SEASON</span>
            <span className="font-display font-bold text-lg sm:text-2xl text-ink">2024 → 2028</span>
          </div>
        </motion.div>

        <div className="mt-16 max-w-3xl border-l border-white/10 pl-6 sm:pl-10 flex flex-col gap-10" data-testid="play-timeline">
          {PLAYS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
              className="relative"
            >
              <span className="absolute -left-[27px] sm:-left-[43px] top-2 h-2 w-2 rounded-full bg-osc" />
              <span className="font-monoos text-[10px] tracking-[0.3em] text-osc">{p.min}</span>
              <h3 className="mt-1 font-display font-bold text-2xl sm:text-3xl tracking-tight text-ink">{p.title}</h3>
              <p className="mt-2 max-w-xl text-sm sm:text-base leading-relaxed text-dim">{p.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 max-w-3xl">
          {PLAY_QUOTE.map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.22 }}
              className={`font-serif-human italic text-2xl sm:text-4xl leading-snug ${i === PLAY_QUOTE.length - 1 ? "text-osc" : "text-ink/85"}`}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <div className="mt-16 flex justify-end">
          <button
            data-testid="play-to-mind-button"
            onClick={() => { blip(); navigate("mind", "MIND.MAP"); }}
            onMouseEnter={() => tick()}
            className="border border-white/15 px-6 py-3 font-monoos text-[11px] tracking-[0.3em] text-dim hover:text-osc hover:border-osc/60 transition-colors duration-300"
          >
            NEXT WORLD: MIND →
          </button>
        </div>
      </div>
    </section>
  );
}
