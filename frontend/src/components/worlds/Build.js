import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TECHS, TECH_CHAINS, PROJECTS, FILTERS, EDUCATION, EXPERIENCE, CERTS, ARCHIVE_QUOTE } from "../../data/content";
import { useOS } from "../../os/context";
import { blip, tick } from "../../lib/audio";
import SectionHeader from "../SectionHeader";
import ProjectCarousel from "./ProjectCarousel";

const isLive = (p) => p.links.some((l) => l.label === "LIVE");

const EASE = [0.16, 1, 0.3, 1];

const RINGS = [
  { items: TECHS.filter((t) => t.ring === 0), r: 17, start: -Math.PI / 2 },
  { items: TECHS.filter((t) => t.ring === 1), r: 28.5, start: -Math.PI / 2 + 0.31 },
  { items: TECHS.filter((t) => t.ring === 2), r: 40, start: -Math.PI / 2 + 0.15 },
];

const POS = RINGS.flatMap(({ items, r, start }) =>
  items.map((t, i) => {
    const a = start + (i / items.length) * Math.PI * 2;
    return { ...t, x: 50 + r * Math.cos(a), y: 46 + r * 0.8 * Math.sin(a) };
  })
);

export default function BuildWorld() {
  const { projectFilter, setProjectFilter, navigate } = useOS();
  const reduced = useReducedMotion();
  const [hoverTech, setHoverTech] = useState(null);
  const [filter, setFilter] = useState("all");
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    if (projectFilter) {
      // "project:MOD-07" opens one project: show them all and bring that one to the centre.
      if (projectFilter.startsWith("project:")) {
        setFilter("all");
        setFocus({ id: projectFilter.slice(8), at: Date.now() });
      } else {
        setFilter(projectFilter);
        setFocus(null);
      }
      setProjectFilter(null);
    }
  }, [projectFilter, setProjectFilter]);

  const shown =
    filter === "all"
      ? PROJECTS
      : filter === "live"
      ? PROJECTS.filter(isLive)
      : PROJECTS.filter((p) => p.tags.includes(filter));

  return (
    <section id="build" className="relative py-28 sm:py-36" data-testid="build-world">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader index="04" label="// WORLD: BUILD" title="A LIVING TECH ECOSYSTEM" right="WORLD 1/5" chapter="CH 01–05 — THE STORY, IN BUILD ORDER" />

        {/* desktop node graph */}
        <div
          className="relative hidden md:block h-[560px] border border-white/10 bg-panel/40"
          data-testid="build-tech-graph"
          onMouseLeave={() => setHoverTech(null)}
        >
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {POS.map((p) => (
              <line
                key={p.n}
                x1="50"
                y1="46"
                x2={p.x}
                y2={p.y}
                stroke={hoverTech === p.n ? "rgba(34,197,94,0.7)" : "rgba(242,240,233,0.1)"}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                style={{ transition: "stroke 0.4s ease" }}
              />
            ))}
          </svg>
          <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="font-display font-extrabold text-xl tracking-tight text-osc">ENGINEERING</span>
            <span className="mt-1 font-monoos text-[9px] tracking-[0.3em] text-faint">CORE NODE</span>
          </div>
          {POS.map((p, i) => (
            <motion.button
              key={p.n}
              data-testid={`build-tech-node-${p.n.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.02 }}
              onMouseEnter={() => setHoverTech(p.n)}
              onClick={() => { blip(); setHoverTech(p.n); }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border px-2 py-1 font-monoos text-[10px] transition-colors duration-300 ${
                hoverTech === p.n
                  ? "border-osc bg-osc/15 text-osc z-10"
                  : "border-white/15 bg-void/80 text-dim hover:text-ink"
              }`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.n}
            </motion.button>
          ))}
          {hoverTech && (
            <div className="absolute bottom-3 left-3 max-w-md border border-white/10 bg-void/95 px-4 py-3 font-monoos text-[10px] text-dim" data-testid="build-tech-tooltip">
              {(() => {
                const t = TECHS.find((x) => x.n === hoverTech);
                return t && t.projects.length
                  ? `LINKED MODULES → ${t.projects.join(" · ")}`
                  : `${hoverTech} — part of the daily stack`;
              })()}
            </div>
          )}
        </div>

        {/* mobile stack cloud */}
        <div className="md:hidden flex flex-wrap gap-2" data-testid="build-tech-cloud">
          {TECHS.map((t) => (
            <span key={t.n} className="border border-white/15 bg-panel/60 px-3 py-1.5 font-monoos text-[11px] text-dim">
              {t.n}
            </span>
          ))}
        </div>

        {/* credentials */}
        <div className="mt-24" data-testid="build-credentials">
          <p className="font-monoos text-[11px] tracking-[0.3em] text-osc">// PAPER TRAIL — EDUCATION · EXPERIENCE · CERTIFICATIONS</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="border border-white/10 bg-panel/50 p-6"
              data-testid="credential-education"
            >
              <p className="font-monoos text-[10px] tracking-[0.3em] text-faint">CH 01 · EDUCATION</p>
              <h3 className="mt-3 font-display font-bold text-xl tracking-tight text-ink">{EDUCATION.degree}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{EDUCATION.school}</p>
              <p className="mt-3 font-monoos text-[11px] tracking-[0.15em] text-osc">
                {EDUCATION.years} · {EDUCATION.cgpa}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {EDUCATION.coursework.map((c) => (
                  <span key={c} className="border border-white/10 px-2 py-0.5 font-monoos text-[9px] text-dim">{c}</span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
              className="border border-osc/30 bg-osc/[0.04] p-6"
              data-testid="credential-experience"
            >
              <p className="font-monoos text-[10px] tracking-[0.3em] text-faint">CH 03 · EXPERIENCE</p>
              <h3 className="mt-3 font-display font-bold text-xl tracking-tight text-ink">
                {EXPERIENCE.role} — <span className="text-osc">{EXPERIENCE.company}</span>
              </h3>
              <p className="mt-2 font-monoos text-[11px] tracking-[0.15em] text-dim">{EXPERIENCE.team}</p>
              <p className="mt-1 font-monoos text-[10px] tracking-[0.2em] text-faint">{EXPERIENCE.years}</p>
              <p className="mt-4 text-sm leading-relaxed text-dim">{EXPERIENCE.text}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
              className="border border-white/10 bg-panel/50 p-6"
              data-testid="credential-certifications"
            >
              <p className="font-monoos text-[10px] tracking-[0.3em] text-faint">CERTIFICATIONS</p>
              <div className="mt-4 space-y-4">
                {CERTS.map((c) => (
                  <div key={c.name} className="border-l border-osc/30 pl-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-monoos text-xs text-ink">{c.name}</span>
                      {c.date && <span className="shrink-0 font-monoos text-[9px] text-faint">{c.date}</span>}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-dim">{c.detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* execution chains */}
        <div className="mt-24" data-testid="build-execution-chains">
          <p className="font-monoos text-[11px] tracking-[0.3em] text-osc">// EXECUTION CHAINS — TECHNOLOGY BECOMING PRODUCT</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TECH_CHAINS.map((c, ci) => (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: EASE, delay: ci * 0.06 }}
                className="border border-white/10 bg-panel/50 p-6"
              >
                {c.chain.map((node, i) => (
                  <div key={node} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`h-1.5 w-1.5 rounded-full ${i === c.chain.length - 1 ? "bg-osc" : "bg-dim"}`} />
                      {i < c.chain.length - 1 && <span className="h-6 w-px bg-gradient-to-b from-osc/50 to-white/10" />}
                    </div>
                    <span className={`font-monoos text-xs tracking-[0.15em] ${i === c.chain.length - 1 ? "text-osc font-bold" : "text-ink"}`}>
                      {node}
                    </span>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>

        {/* system modules: a horizontal, endlessly looping carousel */}
        <div id="modules" className="mt-28 scroll-mt-24" data-testid="build-project-modules">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-monoos text-[11px] tracking-[0.3em] text-osc mr-2">// SYSTEM MODULES</p>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                data-testid={`build-filter-${f.key}`}
                onClick={() => { blip(); setFocus(null); setFilter(f.key); }}
                className={`border px-3 py-1.5 font-monoos text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                  filter === f.key ? "border-osc bg-osc/15 text-osc" : "border-white/15 text-dim hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="mt-8">
            <ProjectCarousel key={filter} projects={shown} focus={focus} reduced={reduced} />
          </div>

          <div className="mt-14 max-w-3xl">
            {ARCHIVE_QUOTE.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.2 }}
                className={`font-serif-human italic text-2xl sm:text-4xl leading-snug ${i === ARCHIVE_QUOTE.length - 1 ? "text-osc" : "text-ink/85"}`}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-between gap-4">
          <button
            data-testid="build-to-source-button"
            onClick={() => navigate("source", "OPEN-SOURCE.LOG")}
            onMouseEnter={() => tick()}
            className="border border-osc/40 px-6 py-3 font-monoos text-[11px] tracking-[0.3em] text-osc/90 hover:bg-osc/10 transition-colors duration-300"
          >
            CH 06: OPEN SOURCE →
          </button>
          <button
            data-testid="build-to-lab-button"
            onClick={() => navigate("lab", "LAB.EXE")}
            onMouseEnter={() => tick()}
            className="border border-white/15 px-6 py-3 font-monoos text-[11px] tracking-[0.3em] text-dim hover:text-osc hover:border-osc/60 transition-colors duration-300"
          >
            NEXT WORLD: LAB →
          </button>
        </div>
      </div>
    </section>
  );
}
