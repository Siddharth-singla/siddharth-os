import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { PROCESSES } from "../data/content";
import { tick } from "../lib/audio";
import AvatarGrain from "./AvatarGrain";

function TypeLine({ text, started, delay }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!started) return;
    let iv;
    const to = setTimeout(() => {
      iv = setInterval(() => {
        setN((v) => {
          if (v >= text.length) {
            clearInterval(iv);
            return v;
          }
          return v + 1;
        });
      }, 34);
    }, delay);
    return () => {
      clearTimeout(to);
      clearInterval(iv);
    };
  }, [started, delay, text]);
  return (
    <span className={n < text.length ? "blink-caret" : ""}>
      {text.slice(0, n)}
    </span>
  );
}

const EASE = [0.16, 1, 0.3, 1];

export default function Hero({ booted }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 60, damping: 16 });
  const sry = useSpring(ry, { stiffness: 60, damping: 16 });
  const smx = useSpring(mx, { stiffness: 50, damping: 14 });
  const smy = useSpring(my, { stiffness: 50, damping: 14 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const grainP = useTransform(scrollYProgress, [0, 0.88], [0, 1]);

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 6);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 5);
    // subtle magnetic drift toward the cursor
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 12);
  };

  return (
    <section
      id="hero"
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); mx.set(0); my.set(0); }}
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      data-testid="hero-section"
    >
      <motion.div style={{ y }} className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 sm:gap-12">
          {/* wordmark — fades with scroll */}
          <motion.div style={{ opacity }} className="min-w-0 flex-1">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
              className="font-monoos text-[11px] sm:text-xs tracking-[0.35em] text-osc"
            >
              // SYSTEM ONLINE — WELCOME, VISITOR
            </motion.p>

            <motion.div
              style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
              className="mt-6"
            >
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: "112%" }}
                  animate={booted ? { y: 0 } : {}}
                  transition={{ duration: 1, ease: EASE, delay: 0.1 }}
                  className="font-display font-extrabold leading-[0.92] tracking-tight text-ink text-[clamp(2.7rem,8.6vw,9rem)]"
                  data-testid="hero-title"
                >
                  SIDDHARTH
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: "112%" }}
                  animate={booted ? { y: 0 } : {}}
                  transition={{ duration: 1, ease: EASE, delay: 0.24 }}
                  className="font-display font-extrabold leading-[0.92] tracking-tight text-osc text-[clamp(2.7rem,8.6vw,9rem)]"
                  data-testid="hero-title-os"
                >
                  .OS
                </motion.h1>
              </div>
            </motion.div>
          </motion.div>

          {/* avatar beside the name — grain-disintegrates on scroll, does not fade */}
          <motion.div
            style={{ x: smx, y: smy }}
            className="shrink-0 w-[52vw] max-w-[240px] sm:w-60 lg:w-[300px] xl:w-[350px] aspect-square"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={booted ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
              className="h-full w-full"
            >
              <AvatarGrain progress={grainP} booted={booted} />
            </motion.div>
          </motion.div>
        </div>

        <motion.div style={{ opacity }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={booted ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 font-monoos text-sm sm:text-base text-dim"
            data-testid="hero-human-exe-line"
          >
            <span className="text-osc">&gt; </span>
            <TypeLine text="human.exe is currently running" started={booted} delay={1100} />
          </motion.div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: 1.25 }}
            >
              <p className="font-serif-human italic text-2xl sm:text-3xl lg:text-4xl leading-snug text-ink/90 max-w-xl">
                A human running on curiosity.
              </p>
              <p className="mt-8 font-monoos text-[11px] tracking-[0.3em] text-faint">
                UPTIME 2024 — ∞
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: 1.4 }}
              className="flex flex-col gap-6"
            >
              <div className="border border-white/10 bg-panel/70 backdrop-blur-sm" data-testid="hero-process-panel">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-monoos text-[10px] tracking-[0.25em] text-faint">
                  <span>TASKLIST</span>
                  <span>6 PROCESSES</span>
                </div>
                <div className="divide-y divide-white/5">
                  {PROCESSES.map((p, i) => (
                    <motion.div
                      key={p}
                      initial={{ opacity: 0, x: -12 }}
                      animate={booted ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 1.55 + i * 0.12, duration: 0.5, ease: EASE }}
                      className="flex items-center justify-between px-4 py-2.5 font-monoos text-xs"
                    >
                      <span className="text-dim">
                        <span className="text-faint mr-3">PID {String(i + 1).padStart(3, "0")}</span>
                        <span className="text-ink">{p}</span>
                      </span>
                      <span className="flex items-center gap-2 text-osc" onMouseEnter={() => tick()}>
                        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-osc" style={{ animationDelay: `${i * 0.3}s` }} />
                        RUNNING
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={booted ? { opacity: 1 } : {}}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
        data-testid="hero-scroll-cue"
      >
        <span className="font-monoos text-[10px] tracking-[0.35em] text-faint">
          SCROLL TO ENTER THE SYSTEM
        </span>
        <div className="h-10 w-px bg-gradient-to-b from-osc/70 to-transparent" />
      </motion.div>
    </section>
  );
}
