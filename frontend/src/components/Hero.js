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
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 4);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 3);
    // a small drift toward the cursor, kept small so the photo never reaches the name
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 8);
  };

  return (
    <section
      id="hero"
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); mx.set(0); my.set(0); }}
      className="relative min-h-screen flex items-start pt-16 overflow-hidden"
      data-testid="hero-section"
    >
      {/* The hero sits on Neon Navy (#131936) with a soft neutral light behind the photo.
          Each later section slides over it on its own tone, so the change marks a new section. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 42%, rgba(239,233,223,0.05), transparent 70%)",
        }}
        data-testid="hero-backdrop"
      />
      <motion.div style={{ y }} className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-16">
        <div className="flex flex-col items-center text-center">
          {/* 1. the name, on its own line above the photo; fades with scroll */}
          <motion.div style={{ opacity }} className="w-full min-w-0">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
              className="font-monoos text-[10px] sm:text-xs tracking-[0.35em] text-osc"
            >
              // SYSTEM ONLINE — WELCOME, VISITOR
            </motion.p>

            <motion.div
              style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
              className="mt-5 overflow-hidden"
            >
              <motion.h1
                initial={{ y: "112%" }}
                animate={booted ? { y: 0 } : {}}
                transition={{ duration: 1, ease: EASE, delay: 0.1 }}
                className="font-display font-extrabold leading-[1.3] sm:leading-[1.02] tracking-tight text-[9.2vw] sm:whitespace-nowrap sm:text-[clamp(2rem,6.3vw,6.1rem)]"
                data-testid="hero-title"
              >
                {/* phones: two lines (the name, then .OS); wider screens: one line.
                    Syne ExtraBold is about 12em wide for "SIDDHARTH.OS", so the sizes keep it inside the screen. */}
                <span className="block sm:inline text-ink" data-testid="hero-title-name">SIDDHARTH</span>
                <span className="block sm:inline sm:ml-[0.06em] text-osc" data-testid="hero-title-os">.OS</span>
              </motion.h1>
            </motion.div>
          </motion.div>

          {/* 2. the photo, centred below the name; grain-disintegrates on scroll */}
          <motion.div
            style={{ x: smx, y: smy }}
            className="mt-8 sm:mt-10 shrink-0 w-[64vw] max-w-[280px] sm:w-[300px] sm:max-w-none lg:w-[340px] aspect-square"
            data-testid="hero-photo"
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

          {/* 3. then the rest of the boot story */}
          <motion.div style={{ opacity }} className="w-full flex flex-col items-center">
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

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: 1.25 }}
              className="mt-10"
            >
              <p className="font-serif-human italic text-2xl sm:text-3xl lg:text-4xl leading-snug text-ink/90">
                A human running on curiosity.
              </p>
              <p className="mt-4 font-monoos text-[11px] tracking-[0.3em] text-faint">
                UPTIME 2024 — ∞
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: 1.4 }}
              className="mt-12 w-full max-w-md text-left"
            >
              <div className="border border-ink/10 bg-panel/70 backdrop-blur-sm" data-testid="hero-process-panel">
                <div className="flex items-center justify-between border-b border-ink/10 px-4 py-2 font-monoos text-[10px] tracking-[0.25em] text-faint">
                  <span>TASKLIST</span>
                  <span>6 PROCESSES</span>
                </div>
                <div className="divide-y divide-ink/5">
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={booted ? { opacity: 1 } : {}}
              transition={{ delay: 2.2, duration: 0.8 }}
              className="mt-14 flex flex-col items-center gap-3"
              data-testid="hero-scroll-cue"
            >
              <span className="font-monoos text-[10px] tracking-[0.35em] text-faint">
                SCROLL TO ENTER THE SYSTEM
              </span>
              <div className="h-10 w-px bg-gradient-to-b from-osc/70 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
