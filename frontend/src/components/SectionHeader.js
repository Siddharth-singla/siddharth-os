import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export default function SectionHeader({ index, label, title, right, chapter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="mb-12 sm:mb-16"
      data-testid={`section-header-${index}`}
    >
      <div className="flex flex-wrap items-center gap-3 font-monoos text-[11px] tracking-[0.3em] text-osc">
        <span>{index}</span>
        <span className="h-px w-10 bg-osc/40" />
        <span className="text-dim">{label}</span>
        {chapter && <span className="text-ink/70">· {chapter}</span>}
        {right && <span className="ml-auto hidden sm:inline text-faint">{right}</span>}
      </div>
      <h2
        className="mt-4 font-display font-bold tracking-tight leading-[0.95] text-5xl sm:text-7xl lg:text-8xl bg-gradient-to-b from-[#F7F6F0] via-[#CBCAC3] to-[#85847E] bg-clip-text text-transparent"
        data-testid={`section-title-${index}`}
      >
        {title}
      </h2>
    </motion.div>
  );
}
