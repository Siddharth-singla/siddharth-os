import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import SectionHeader from "./SectionHeader";

// the story text, moved verbatim from the old hero paragraph
const STORY =
  "Not a portfolio. An operating system of one person — engineer, builder, contributor, creative, athlete, experimenter. Every process is running. Everything is connected.";

function Char({ c, progress, start, end }) {
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  return <motion.span style={{ opacity }}>{c}</motion.span>;
}

export default function About() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "end 0.5"] });
  const chars = Array.from(STORY);

  return (
    <section id="about" className="relative py-24 sm:py-36" data-testid="about-world">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader index="00" label="// OPERATOR PROFILE" title="THE OPERATOR" right="ABOUT" />
        <p
          ref={ref}
          className="font-serif-human italic text-2xl sm:text-4xl lg:text-[2.9rem] leading-snug text-ink max-w-5xl whitespace-pre-wrap"
          data-testid="about-story-reveal"
        >
          {chars.map((c, i) => {
            const start = i / chars.length;
            return reduced ? (
              <span key={i}>{c}</span>
            ) : (
              <Char key={i} c={c} progress={scrollYProgress} start={start} end={start + 2.2 / chars.length} />
            );
          })}
        </p>
        <p className="mt-10 font-monoos text-[11px] tracking-[0.3em] text-faint" data-testid="about-uptime">
          UPTIME 2024 — ∞
        </p>
      </div>
    </section>
  );
}
