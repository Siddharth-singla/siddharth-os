import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { PENDING } from "../../data/content";
import { blip, tick } from "../../lib/audio";

const SPEED = 26; // auto-scroll speed in px per second
const RESUME_AFTER = 4500; // ms after the last interaction before auto-scroll resumes

function Card({ p, index, total, clone, focused }) {
  const stages = p.stages.filter(([, text]) => text && text !== PENDING);
  return (
    <article
      data-id={p.id}
      data-testid={clone ? undefined : `build-project-${p.id.toLowerCase()}`}
      aria-hidden={clone ? "true" : undefined}
      className={`relative flex w-[84vw] max-w-[560px] shrink-0 flex-col overflow-hidden rounded-[1.75rem] border bg-panel p-6 sm:w-[520px] sm:p-8 lg:w-[560px] transition-[border-color,box-shadow] duration-500 ${
        focused ? "border-osc/70 shadow-[0_0_0_1px_rgba(216,194,156,0.3),0_24px_70px_rgba(3,5,14,0.45)]" : "border-ink/15 shadow-[0_24px_70px_rgba(3,5,14,0.35)]"
      }`}
    >
      {/* project number: top-right, with space reserved so nothing sits on top of it */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute right-5 top-3 sm:right-7 font-display font-extrabold leading-none text-outline text-[2.5rem] sm:text-[clamp(3.5rem,6vw,5.25rem)] opacity-80"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* meta line (id · date) beside the number; the chapter tag gets its own line below it.
          On phones that line starts under the number, so it can use the full card width. */}
      <div data-card-head className="flex flex-wrap items-center gap-x-3 gap-y-1 pr-[5.5rem] sm:pr-36">
        <span className="font-monoos text-[10px] text-faint">{p.id}</span>
        {p.date && <span className="font-monoos text-[9px] tracking-[0.2em] text-faint">{p.date}</span>}
      </div>
      <div data-card-head className="mt-7 sm:mt-3 flex sm:pr-36">
        <span className="border border-osc/40 bg-osc/10 px-2 py-0.5 font-monoos text-[9px] tracking-[0.2em] text-osc">{p.chapter}</span>
      </div>

      <h3 className="mt-4 pr-20 sm:pr-24 font-display font-bold text-2xl sm:text-3xl leading-tight tracking-tight text-ink">{p.name}</h3>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {p.stack.map((s) => (
          <span key={s} className="border border-ink/10 px-2 py-0.5 font-monoos text-[9px] text-dim">{s}</span>
        ))}
      </div>

      <div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {stages.map(([label, text]) => (
          <div key={label}>
            <p className={`font-monoos text-[9px] tracking-[0.25em] ${label === "WHAT I LEARNED" ? "text-osc" : "text-dim"}`}>{label}</p>
            <p className="mt-1 text-xs leading-relaxed text-dim">{text}</p>
          </div>
        ))}
      </div>

      {/* links: bottom-right of the card */}
      <div className="mt-auto flex items-end justify-between gap-3 pt-8">
        <span className="font-monoos text-[9px] tracking-[0.25em] text-faint">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="flex flex-wrap justify-end gap-2">
          {p.links.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={clone ? -1 : undefined}
              draggable={false}
              data-testid={clone ? undefined : `project-link-${p.id.toLowerCase()}-${l.label.toLowerCase()}`}
              onMouseEnter={() => tick()}
              aria-label={`Open ${p.name}: ${l.label === "LIVE" ? "live site" : "GitHub repository"} (opens in a new tab)`}
              className="flex items-center gap-1 border border-ink/15 px-3 py-1.5 font-monoos text-[9px] tracking-[0.2em] text-dim hover:text-osc hover:border-osc/60 transition-colors duration-300"
            >
              {l.label} <ArrowUpRight size={11} />
            </a>
          ))}
        </span>
      </div>
    </article>
  );
}

// focus: { id, at } — set by a voice command to bring one project to the centre.
export default function ProjectCarousel({ projects, focus, reduced }) {
  const trackRef = useRef(null);
  const pos = useRef(0); // scrollLeft as a float (browsers round scrollLeft)
  const setW = useRef(0); // width of one full set of cards
  const step = useRef(0); // width of one card plus the gap
  const resumeAt = useRef(0);
  const hovering = useRef(false);
  const visible = useRef(false);
  const tween = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const [current, setCurrent] = useState(0);
  const [highlight, setHighlight] = useState(null);

  const n = projects.length;
  const loop = n >= 3;
  const copies = loop ? 3 : 1;

  const pause = (ms = RESUME_AFTER) => {
    resumeAt.current = Math.max(resumeAt.current, performance.now() + ms);
  };

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cards = el.querySelectorAll("article");
    if (!cards.length) return;
    step.current = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    setW.current = loop ? cards[n].offsetLeft - cards[0].offsetLeft : 0;
  }, [loop, n]);

  // keep the position inside the middle copy so the loop never runs out
  const wrap = useCallback(() => {
    const W = setW.current;
    if (!loop || !W) return;
    if (pos.current < W * 0.5) pos.current += W;
    else if (pos.current > W * 1.5) pos.current -= W;
  }, [loop]);

  const apply = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    wrap();
    el.scrollLeft = pos.current;
  }, [wrap]);

  // start at the beginning of the middle copy
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    pos.current = loop ? setW.current : 0;
    el.scrollLeft = pos.current;
    setCurrent(0);
    const ro = new ResizeObserver(() => {
      const W0 = setW.current;
      const rel = W0 ? (pos.current % W0) / W0 : 0;
      measure();
      if (loop && setW.current) pos.current = setW.current + rel * setW.current;
      apply();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [projects, loop, measure, apply]);

  // only animate while the carousel is on screen
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // animation loop: tweens (arrows / voice focus) and the slow auto-scroll
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const el = trackRef.current;
      if (el) {
        if (tween.current) {
          const t = tween.current;
          const k = Math.min(1, (now - t.start) / t.dur);
          const e = 1 - Math.pow(1 - k, 3);
          pos.current = t.from + (t.to - t.from) * e;
          el.scrollLeft = pos.current;
          if (k >= 1) {
            tween.current = null;
            apply();
          }
        } else if (
          loop && !reduced && visible.current && !hovering.current && !drag.current &&
          now > resumeAt.current && !document.hidden
        ) {
          pos.current += SPEED * dt;
          apply();
        }
        if (step.current && n) {
          const center = pos.current + el.clientWidth / 2;
          const first = el.querySelector("article");
          const base = first ? first.offsetLeft : 0;
          const idx = Math.floor((center - base) / step.current);
          const i = ((idx % n) + n) % n;
          setCurrent((c) => (c === i ? c : i));
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [loop, reduced, n, apply]);

  const glide = useCallback((to, dur = 650) => {
    tween.current = { from: pos.current, to, start: performance.now(), dur: reduced ? 1 : dur };
  }, [reduced]);

  const move = (dir) => {
    blip();
    pause(6000);
    if (!loop) {
      const el = trackRef.current;
      const max = el ? el.scrollWidth - el.clientWidth : 0;
      glide(Math.max(0, Math.min(max, pos.current + dir * step.current)));
      return;
    }
    glide(pos.current + dir * step.current);
  };

  // a voice command asked for a specific project: bring it to the centre and highlight it
  useEffect(() => {
    const focusId = focus && focus.id;
    if (!focusId) return;
    const el = trackRef.current;
    if (!el) return;
    const i = projects.findIndex((p) => p.id === focusId);
    if (i < 0) return;
    measure();
    const cards = el.querySelectorAll("article");
    const card = cards[(loop ? n : 0) + i];
    if (!card) return;
    let to = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    if (loop) {
      // go the short way round
      const W = setW.current;
      while (to - pos.current > W / 2) to -= W;
      while (pos.current - to > W / 2) to += W;
    } else {
      to = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, to));
    }
    pause(9000);
    glide(to, 900);
    setHighlight(focusId);
    // long enough to still be lit after the page has scrolled down to the carousel
    const t = setTimeout(() => setHighlight(null), 8000);
    return () => clearTimeout(t);
    // runs only when a new focus request arrives
  }, [focus]);

  // the visitor scrolled the track themselves (trackpad, touch, keyboard)
  const onScroll = () => {
    const el = trackRef.current;
    if (!el || tween.current || drag.current) return;
    if (Math.abs(el.scrollLeft - pos.current) > 1.5) {
      pos.current = el.scrollLeft;
      pause();
      if (loop && setW.current) {
        const before = pos.current;
        wrap();
        if (pos.current !== before) el.scrollLeft = pos.current;
      }
    }
  };

  // drag with the mouse (touch devices already swipe natively)
  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    tween.current = null;
    drag.current = { x: e.clientX, start: pos.current, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4 && !d.moved) {
      d.moved = true;
      trackRef.current?.setPointerCapture?.(e.pointerId);
    }
    if (d.moved) {
      pos.current = d.start - dx;
      apply();
    }
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && d.moved) {
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 0);
      pause();
    }
  };
  const onClickCapture = (e) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
  };

  if (!n) {
    return <p className="py-16 text-center font-monoos text-xs text-faint">// NO MODULES IN THIS FILTER</p>;
  }

  const sets = Array.from({ length: copies }, (_, c) => c);

  return (
    <div className="relative" data-testid="build-carousel">
      <div className="flex items-center justify-between gap-4 pb-5">
        <p className="font-monoos text-[10px] tracking-[0.25em] text-faint" aria-live="polite">
          <span className="text-osc">{String(current + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")} · {projects[current] ? projects[current].name.split(" — ")[0].toUpperCase() : ""}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous project"
            data-testid="carousel-prev"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-dim hover:border-osc/60 hover:text-osc transition-colors duration-300"
          >
            <ArrowLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next project"
            data-testid="carousel-next"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-dim hover:border-osc/60 hover:text-osc transition-colors duration-300"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects. Use the left and right arrow keys to move."
        data-testid="build-carousel-track"
        data-lenis-prevent-horizontal=""
        onScroll={onScroll}
        onMouseEnter={() => { hovering.current = true; }}
        onMouseLeave={() => { hovering.current = false; pause(1200); }}
        onFocus={() => pause(8000)}
        onTouchStart={() => pause()}
        onWheel={(e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) pause(); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
        className="no-scrollbar relative -mx-4 flex select-none items-stretch gap-5 overflow-x-auto px-4 pb-6 pt-2 outline-none sm:-mx-6 sm:px-6 cursor-grab active:cursor-grabbing focus-visible:ring-1 focus-visible:ring-osc/50 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
      >
        {sets.map((c) =>
          projects.map((p, i) => (
            <Card
              key={`${c}-${p.id}`}
              p={p}
              index={i}
              total={n}
              clone={loop && c !== 1}
              focused={highlight === p.id}
            />
          ))
        )}
      </div>

      <p className="mt-2 font-monoos text-[10px] tracking-[0.2em] text-faint">
        // DRAG, SWIPE OR USE THE ARROWS. IT LOOPS FOREVER, LIKE THE WORK.
      </p>
    </div>
  );
}
