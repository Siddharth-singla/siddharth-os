import { motion } from "framer-motion";
import { LAB } from "../../data/content";
import { useOS } from "../../os/context";
import { blip, tick } from "../../lib/audio";
import SectionHeader from "../SectionHeader";

const EASE = [0.16, 1, 0.3, 1];

const STATUS_STYLE = {
  LEARNING: "border-warn/40 text-warn",
  EXPERIMENTING: "border-dim/40 text-dim",
  BUILDING: "border-osc/40 text-osc",
  BROKEN: "border-err/40 text-err",
  SHIPPING: "border-osc bg-osc/15 text-osc",
};

export default function Lab() {
  const { navigate } = useOS();

  return (
    <section id="lab" className="relative py-28 sm:py-36" data-testid="lab-world">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          index="06"
          label="// WORLD: LAB"
          title="CURRENTLY EXPERIMENTING WITH"
          right="BUILD 0.9.4-UNSTABLE"
        />

        <p className="-mt-6 mb-10 max-w-lg font-monoos text-[11px] leading-relaxed tracking-[0.15em] text-faint" data-testid="lab-disclaimer">
          // WARNING: THIS WORLD IS INTENTIONALLY UNFINISHED. STABILITY NOT
          GUARANTEED. CURIOSITY EXCEEDS CAPACITY.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/10 border border-ink/10" data-testid="lab-grid">
          {LAB.map((item, i) => (
            <motion.div
              key={item.n}
              data-testid={`lab-card-${item.n.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.06 }}
              onMouseEnter={() => tick()}
              onClick={() => blip()}
              className={`group relative bg-surface p-6 min-h-[168px] flex flex-col justify-between hover:bg-panel transition-colors duration-300 ${
                item.status === "BROKEN" ? "flicker" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-monoos text-[10px] text-faint">EXP-{String(i + 1).padStart(3, "0")}</span>
                <span className={`border px-2 py-0.5 font-monoos text-[9px] tracking-[0.2em] ${STATUS_STYLE[item.status]}`} data-testid={`lab-status-${item.n.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                  {item.status}
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-ink group-hover:text-osc transition-colors duration-300">
                  {item.n}
                </h3>
                <p className="mt-2 font-monoos text-[9px] tracking-[0.2em] text-faint">SPEC: LOADING…</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex justify-end">
          <button
            data-testid="lab-to-play-button"
            onClick={() => navigate("play", "PLAY.EXE")}
            onMouseEnter={() => tick()}
            className="border border-ink/15 px-6 py-3 font-monoos text-[11px] tracking-[0.3em] text-dim hover:text-osc hover:border-osc/60 transition-colors duration-300"
          >
            NEXT WORLD: PLAY →
          </button>
        </div>
      </div>
    </section>
  );
}
