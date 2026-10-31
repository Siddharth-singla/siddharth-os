import { motion } from "framer-motion";
import { ArrowUpRight, GitPullRequest, GitMerge } from "lucide-react";
import { OSS } from "../../data/content";
import { tick } from "../../lib/audio";
import SectionHeader from "../SectionHeader";

const EASE = [0.16, 1, 0.3, 1];

const STATE_STYLE = {
  MERGED: "border-osc/50 bg-osc/10 text-osc",
  OPEN: "border-warn/50 bg-warn/10 text-warn",
};

export default function Source() {
  return (
    <section id="source" className="relative py-28 sm:py-36" data-testid="source-world">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader index="05" label="// GIVING BACK" title="OPEN SOURCE, LABELLED HONESTLY" right="2 REPOS · 6 PULL REQUESTS" chapter="CH 06" />

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="-mt-4 mb-12 max-w-xl font-monoos text-[11px] leading-relaxed tracking-[0.15em] text-faint"
        >
          // EVERY PULL REQUEST BELOW IS REAL — MERGED OR OPEN, EXACTLY AS
          // LABELLED. THE HABIT: READ OTHER PEOPLE'S CODE, LEAVE IT BETTER.
        </motion.p>

        <div className="space-y-8" data-testid="oss-list">
          {OSS.map((repo, ri) => {
            const merged = repo.prs.filter((p) => p.state === "MERGED").length;
            const open = repo.prs.length - merged;
            return (
              <motion.div
                key={repo.repo}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, ease: EASE, delay: ri * 0.08 }}
                className="border border-white/10 bg-panel/50"
                data-testid={`oss-repo-${repo.repo.split("/")[1]}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 px-5 sm:px-6 py-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-monoos text-sm font-bold text-ink">{repo.repo}</span>
                    {repo.desc && <span className="font-monoos text-[10px] text-faint">— {repo.desc}</span>}
                  </div>
                  <span className="font-monoos text-[10px] tracking-[0.2em] text-dim">
                    {merged} MERGED · {open} OPEN
                  </span>
                </div>
                <div>
                  {repo.prs.map((pr, pi) => (
                    <motion.a
                      key={pr.id}
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`oss-pr-${repo.repo.split("/")[1]}-${pr.id.replace("#", "")}`}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, ease: EASE, delay: pi * 0.05 }}
                      onMouseEnter={() => tick()}
                      className="group flex items-center gap-3 border-b border-white/5 px-5 sm:px-6 py-3.5 last:border-b-0 hover:bg-white/[0.03] transition-colors duration-300"
                    >
                      {pr.state === "MERGED" ? (
                        <GitMerge size={13} className="shrink-0 text-osc" />
                      ) : (
                        <GitPullRequest size={13} className="shrink-0 text-warn" />
                      )}
                      <span className="font-monoos text-[11px] text-dim">{pr.id}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-ink/85 group-hover:text-osc transition-colors duration-300">
                        {pr.title}
                      </span>
                      <span className={`shrink-0 border px-2 py-0.5 font-monoos text-[9px] tracking-[0.2em] ${STATE_STYLE[pr.state]}`}>
                        {pr.state}
                      </span>
                      <ArrowUpRight size={12} className="shrink-0 text-faint group-hover:text-osc transition-colors duration-300" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
