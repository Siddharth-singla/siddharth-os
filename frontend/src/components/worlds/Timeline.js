import { useRef } from "react";
import { motion } from "framer-motion";
import { TIMELINE, TIMELINE_QUOTE } from "../../data/content";
import { tick } from "../../lib/audio";
import SectionHeader from "../SectionHeader";

const EASE = [0.16, 1, 0.3, 1];

export default function Timeline() {
  // the scrollbar is hidden, so a mouse can drag the cards sideways (touch and trackpads swipe natively)
  const rowRef = useRef(null);
  const drag = useRef(null);
  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: rowRef.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true;
      rowRef.current.setPointerCapture?.(e.pointerId);
    }
    if (d.moved) rowRef.current.scrollLeft = d.left - dx;
  };
  const onPointerUp = () => { drag.current = null; };
  return (
    <section id="timeline" className="relative py-28 sm:py-36" data-testid="timeline-world">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader index="09" label="// CHAPTERS" title="THE STORY SO FAR" right="2024 → ∞" />

        <div
          ref={rowRef}
          className="no-scrollbar overflow-x-auto pb-4 select-none cursor-grab active:cursor-grabbing"
          data-testid="timeline-scroll"
          data-lenis-prevent-horizontal=""
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="flex gap-5 sm:gap-6 min-w-max items-stretch">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={t.year}
                data-testid={`timeline-${t.year === "∞" ? "infinity" : t.year}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: EASE, delay: i * 0.08 }}
                onMouseEnter={() => tick()}
                className={`w-[280px] sm:w-[360px] shrink-0 snap-start border p-6 sm:p-8 ${
                  t.future
                    ? "border-dashed border-white/15 bg-transparent"
                    : "border-white/10 bg-panel/60"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className={`font-display font-extrabold text-5xl sm:text-6xl tracking-tight ${t.future ? "text-osc flicker" : "text-ink"}`}>
                    {t.year}
                  </span>
                  <span className="font-monoos text-[10px] tracking-[0.3em] text-faint">
                    {String(i + 1).padStart(2, "0")}/06
                  </span>
                </div>
                <p className={`mt-3 font-monoos text-xs tracking-[0.35em] ${t.future ? "text-warn" : "text-osc"}`}>
                  {t.label}
                </p>
                {t.future ? (
                  <p className="mt-8 font-monoos text-[10px] tracking-[0.25em] text-faint leading-relaxed">
                    UNWRITTEN.
                    <br />
                    TO BE CONTINUED.
                  </p>
                ) : (
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {t.items.map((item) => (
                      <span key={item} className="border border-white/10 px-2 py-1 font-monoos text-[10px] text-dim">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <p className="mt-4 font-monoos text-[10px] tracking-[0.3em] text-faint">SWIPE OR DRAG SIDEWAYS →</p>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-14 max-w-3xl font-serif-human italic text-2xl sm:text-4xl leading-snug text-ink/85"
          data-testid="timeline-quote"
        >
          {TIMELINE_QUOTE}
        </motion.p>
      </div>
    </section>
  );
}
