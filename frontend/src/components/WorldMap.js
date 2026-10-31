import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Trophy, FlaskConical, Network, Rocket, ArrowUpRight } from "lucide-react";
import { WORLDS } from "../data/content";
import { useOS } from "../os/context";
import { blip, tick } from "../lib/audio";
import SectionHeader from "./SectionHeader";

const ICONS = { Terminal, Trophy, FlaskConical, Network, Rocket };
const EASE = [0.16, 1, 0.3, 1];

export default function WorldMap() {
  const { navigate } = useOS();
  const [hovered, setHovered] = useState(null);

  return (
    <section id="map" className="relative py-28 sm:py-36" data-testid="world-map-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader index="01" label="// WORLD MAP" title="FIVE WORLDS. ONE SYSTEM." />
      </div>

      {/* desktop constellation */}
      <div className="hidden md:block relative h-[78vh] min-h-[620px] max-w-6xl mx-auto" data-testid="world-map-desktop">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {WORLDS.map((wd) => (
            <line
              key={wd.id}
              x1="50"
              y1="44"
              x2={wd.pos.x}
              y2={wd.pos.y}
              stroke={hovered === wd.id ? "rgba(217,204,191,0.75)" : "rgba(238,234,230,0.14)"}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              style={{ transition: "stroke 0.4s ease" }}
            />
          ))}
        </svg>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          data-testid="world-map-center-node"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute h-28 w-28 rounded-full border border-osc/25 animate-ping" style={{ animationDuration: "3s" }} />
            <span className="absolute h-20 w-20 rounded-full border border-osc/40" />
            <span className="font-display font-extrabold text-2xl tracking-tight text-ink">SIDDHARTH</span>
          </div>
          <span className="mt-4 font-monoos text-[10px] tracking-[0.3em] text-faint">CORE PROCESS</span>
        </motion.div>

        {WORLDS.map((wd, i) => {
          const Icon = ICONS[wd.glyph];
          return (
            <motion.button
              key={wd.id}
              data-testid={`world-node-${wd.id}`}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.1 }}
              onMouseEnter={() => { setHovered(wd.id); tick(); }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { blip(); navigate(wd.section, `${wd.label}.EXE`); }}
              className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-center"
              style={{ left: `${wd.pos.x}%`, top: `${wd.pos.y}%` }}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300 ${
                  hovered === wd.id
                    ? "border-osc bg-osc/15 text-osc scale-110"
                    : "border-ink/15 bg-panel/80 text-dim group-hover:text-ink"
                }`}
              >
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <span className={`font-monoos text-xs tracking-[0.25em] transition-colors duration-300 ${hovered === wd.id ? "text-osc" : "text-ink"}`}>
                {wd.label}
              </span>
              <span className={`font-monoos text-[9px] tracking-[0.2em] ${wd.status === "LOADING" || wd.status === "UNSTABLE" ? "text-warn" : "text-osc"}`}>
                ● {wd.status}
              </span>
              {hovered === wd.id && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-3 w-52 border border-ink/10 bg-panel/95 backdrop-blur-md p-3 text-left"
                >
                  <span className="block font-monoos text-[10px] leading-relaxed text-dim normal-case">{wd.desc}</span>
                  <span className="mt-2 flex items-center gap-1 font-monoos text-[10px] tracking-[0.2em] text-osc">
                    ENTER <ArrowUpRight size={11} />
                  </span>
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* mobile constellation */}
      <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6" data-testid="world-map-mobile">
        <div className="relative border-l border-ink/10 pl-6 flex flex-col gap-7 py-4">
          {WORLDS.map((wd, i) => {
            const Icon = ICONS[wd.glyph];
            return (
              <motion.button
                key={wd.id}
                data-testid={`world-node-mobile-${wd.id}`}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.07 }}
                onClick={() => { blip(); navigate(wd.section, `${wd.label}.EXE`); }}
                className="group relative flex items-center gap-4 text-left"
              >
                <span className="absolute -left-[31px] h-2 w-2 rounded-full bg-osc" />
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-panel text-dim group-hover:text-osc group-hover:border-osc/60 transition-colors duration-300">
                  <Icon size={17} strokeWidth={1.6} />
                </span>
                <span>
                  <span className="flex items-center gap-2 font-monoos text-sm tracking-[0.2em] text-ink">
                    {wd.label}
                    <span className={`text-[9px] ${wd.status === "LOADING" || wd.status === "UNSTABLE" ? "text-warn" : "text-osc"}`}>● {wd.status}</span>
                  </span>
                  <span className="mt-0.5 block font-monoos text-[10px] text-faint">{wd.desc}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
