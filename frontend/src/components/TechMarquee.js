import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  SiPython, SiJavascript, SiC, SiCplusplus, SiKotlin, SiReact, SiNextdotjs,
  SiNodedotjs, SiExpress, SiMongodb, SiSupabase, SiFirebase, SiLangchain,
  SiScikitlearn, SiPandas, SiNumpy, SiFastapi, SiGit, SiGithub, SiPostman, SiVercel,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import {
  Database, Braces, KeyRound, ListTree, Cpu, Network, Boxes, Layers, SlidersHorizontal,
} from "lucide-react";
import { TECHS } from "../data/content";

const ICONS = {
  Python: SiPython,
  Java: FaJava,
  JavaScript: SiJavascript,
  "C++": SiCplusplus,
  SQL: Database,
  Kotlin: SiKotlin,
  React: SiReact,
  "Next.js": SiNextdotjs,
  "Node.js": SiNodedotjs,
  Express: SiExpress,
  MongoDB: SiMongodb,
  Supabase: SiSupabase,
  Firebase: SiFirebase,
  "REST APIs": Braces,
  "JWT Authentication": KeyRound,
  LangChain: SiLangchain,
  ChromaDB: Database,
  "Scikit-learn": SiScikitlearn,
  Pandas: SiPandas,
  NumPy: SiNumpy,
  "Feature Engineering": SlidersHorizontal,
  DSA: ListTree,
  "Operating Systems": Cpu,
  "Computer Networks": Network,
  OOP: Boxes,
  "System Design Basics": Layers,
  Git: SiGit,
  GitHub: SiGithub,
  FastAPI: SiFastapi,
  Vercel: SiVercel,
  Postman: SiPostman,
};

function Chip({ t }) {
  const Icon = ICONS[t.n] || Braces;
  return (
    <span className="flex items-center gap-3 rounded-full border border-white/10 bg-panel/80 px-6 py-3.5 whitespace-nowrap">
      <Icon size={18} className="text-osc shrink-0" aria-hidden="true" />
      <span className="font-monoos text-sm tracking-wide text-ink">{t.n}</span>
    </span>
  );
}

export default function TechMarquee() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["1.5%", "-36%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-36%", "1.5%"]);

  const half = Math.ceil(TECHS.length / 2);
  const rows = [TECHS.slice(0, half), TECHS.slice(half)];

  return (
    <section ref={ref} id="stack" className="relative overflow-hidden py-16 sm:py-24" data-testid="tech-marquee">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <p className="font-monoos text-[11px] tracking-[0.3em] text-osc">
          // STACK.TXT — {TECHS.length} MODULES, SCROLL-DRIVEN
        </p>
      </div>
      <div className="space-y-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          style={reduced ? undefined : { x: x1 }}
          className="flex w-max gap-4 pr-4"
          data-testid="tech-marquee-row-1"
        >
          {[0, 1].map((c) => rows[0].map((t) => <Chip key={`${c}-${t.n}`} t={t} />))}
        </motion.div>
        <motion.div
          style={reduced ? undefined : { x: x2 }}
          className="flex w-max gap-4 pr-4"
          data-testid="tech-marquee-row-2"
        >
          {[0, 1].map((c) => rows[1].map((t) => <Chip key={`${c}-${t.n}`} t={t} />))}
        </motion.div>
      </div>
    </section>
  );
}
