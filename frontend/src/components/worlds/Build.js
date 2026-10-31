import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { TECHS, TECH_CHAINS, PROJECTS, FILTERS, EDUCATION, EXPERIENCE, CERTS, ARCHIVE_QUOTE, PENDING } from "../../data/content";

const isLive = (p) => p.links.some((l) => l.label === "LIVE");
import { useOS } from "../../os/context";
import { blip, scrollTick, tick } from "../../lib/audio";
import SectionHeader from "../SectionHeader";

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

function ModuleCard({ p, i, total, reduced, coverRef, selfRef }) {
  const { scrollYProgress: coverP } = useScroll(
    // The card only dims once the next card has covered most of the screen,
    // so a card you jump to (e.g. "tell me about savoury") arrives at full brightness.
    coverRef ? { target: coverRef, offset: ["start 0.6", "start 0.15"] } : {}
  );
  const scale = useTransform(coverP, [0, 1], [1, 0.94]);
  const dim = useTransform(coverP, [0, 1], [1, 0.45]);
  const isLast = i === total - 1;

  return (
    <div
      ref={selfRef}
      className="sticky pb-10"
      style={{ top: `calc(4.5rem + ${i * 18}px)`, zIndex: i + 1 }}
      data-testid={`build-project-${p.id.toLowerCase()}`}
    >
      <motion.div
        style={reduced || isLast || !coverRef ? {} : { scale, opacity: dim }}
        className="relative origin-top overflow-hidden rounded-[2rem] border border-white/15 bg-panel px-5 py-7 sm:px-10 sm:py-12 min-h-[380px] sm:min-h-[440px] shadow-[0_-24px_70px_rgba(0,0,0,0.55)]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-3 right-6 sm:right-10 font-display font-extrabold leading-none text-outline text-[clamp(4.5rem,9vw,8rem)] opacity-80"
        >
          {String(i + 1).padStart(2, "0")}
        </span>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-monoos text-[10px] text-faint">{p.id}</span>
          <span className="border border-osc/40 bg-osc/10 px-2 py-0.5 font-monoos text-[9px] tracking-[0.2em] text-osc">{p.chapter}</span>
          {p.date && <span className="font-monoos text-[9px] tracking-[0.2em] text-faint">{p.date}</span>}
          <span className="ml-auto flex flex-wrap gap-2">
            {p.links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`project-link-${p.id.toLowerCase()}-${l.label.toLowerCase()}`}
                onMouseEnter={() => tick()}
                aria-label={`Open ${p.name} — ${l.label === "LIVE" ? "live site" : "GitHub repository"} (opens in a new tab)`}
                className="flex items-center gap-1 border border-white/15 px-2.5 py-1.5 font-monoos text-[9px] tracking-[0.2em] text-dim hover:text-osc hover:border-osc/60 transition-colors duration-300"
              >
                {l.label} <ArrowUpRight size={11} />
              </a>
            ))}
          </span>
        </div>

        <h3 className="mt-4 font-display font-bold text-2xl sm:text-4xl tracking-tight text-ink max-w-[80%]">{p.name}</h3>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <span key={s} className="border border-white/10 px-2 py-0.5 font-monoos text-[9px] text-dim">{s}</span>
          ))}
        </div>

        <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {p.stages
            .filter(([, text]) => text && text !== PENDING)
            .map(([label, text]) => (
              <div key={label}>
                <p className={`font-monoos text-[9px] tracking-[0.25em] ${label === "WHAT I LEARNED" ? "text-osc" : "text-dim"}`}>{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-dim">{text}</p>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function BuildWorld() {
  const { projectFilter, setProjectFilter, navigate } = useOS();
  const reduced = useReducedMotion();
  const [hoverTech, setHoverTech] = useState(null);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(0);
  const shells = useRef([]);
  const stackRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start 0.85", "end 0.4"] });
  const railScale = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  useEffect(() => {
    if (projectFilter) {
      // "project:MOD-07" opens one project, so show them all and let the app scroll to it.
      setFilter(projectFilter.startsWith("project:") ? "all" : projectFilter);
      setProjectFilter(null);
    }
  }, [projectFilter, setProjectFilter]);

  const shown =
    filter === "all"
      ? PROJECTS
      : filter === "live"
      ? PROJECTS.filter(isLive)
      : PROJECTS.filter((p) => p.tags.includes(filter));

  if (shells.current.length !== shown.length) {
    shells.current = shown.map((_, i) => shells.current[i] || { current: null });
  }

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let cur = 0;
        shells.current.forEach((r, i) => {
          const el = r && r.current;
          if (el && el.getBoundingClientRect().top <= 72 + i * 18 + 16) cur = i;
        });
        setActive((a) => (a === cur ? a : cur));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!reduced) scrollTick();
  }, [active, reduced]);

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

        {/* system modules — pinned, stacked chapters */}
        <div className="mt-28" data-testid="build-project-modules">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-monoos text-[11px] tracking-[0.3em] text-osc mr-2">// SYSTEM MODULES</p>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                data-testid={`build-filter-${f.key}`}
                onClick={() => { blip(); setFilter(f.key); }}
                className={`border px-3 py-1.5 font-monoos text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                  filter === f.key ? "border-osc bg-osc/15 text-osc" : "border-white/15 text-dim hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="mt-4 font-monoos text-[10px] tracking-[0.2em] text-faint">
            // SYSTEM MODULES — EACH CARD STACKS UP AND SCALES BACK AS THE NEXT ONE ARRIVES.
          </p>

          <div ref={stackRef} id="modules" className="relative mt-8 scroll-mt-28" data-testid="build-card-stack">
            {/* side progress rail */}
            <div className="absolute right-0 top-6 bottom-0 w-[3px] bg-white/5" aria-hidden="true">
              <motion.div
                style={{ scaleY: reduced ? 1 : railScale }}
                className="h-full w-full origin-top bg-osc/70"
                data-testid="build-stack-progress"
              />
            </div>

            <div className="pr-5">
              {shown.map((p, i) => (
                <div key={`${filter}-${p.id}`} id={`module-${p.id.toLowerCase()}`}>
                  <ModuleCard
                    p={p}
                    i={i}
                    total={shown.length}
                    reduced={reduced}
                    selfRef={shells.current[i]}
                    coverRef={shells.current[i + 1] || null}
                  />
                </div>
              ))}
              {!shown.length && (
                <p className="py-16 text-center font-monoos text-xs text-faint">// NO MODULES IN THIS FILTER</p>
              )}
            </div>
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
