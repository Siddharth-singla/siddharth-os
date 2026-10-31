import { useEffect, useRef } from "react";
import { NODE_LABELS } from "../data/content";

export default function ParticleField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let raf = 0;
    let particles = [];
    // Hero text and the photo are no-go zones: a floating label or dot that drifts into one is
    // hidden at once and fades back in after it leaves, so nothing is ever drawn over them.
    let zones = [];
    const PAD = 6;
    const FONT = "10px 'JetBrains Mono', monospace";

    function readZones() {
      zones = [];
      for (const el of document.querySelectorAll("[data-particle-avoid]")) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || r.bottom < 0 || r.top > h) continue;
        zones.push({ l: r.left - PAD, t: r.top - PAD, r: r.right + PAD, b: r.bottom + PAD });
      }
    }
    const hits = (l, t, r, b) => zones.some((z) => l < z.r && r > z.l && t < z.b && b > z.t);

    function init() {
      const count = w < 768 ? 26 : 56;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.3 + 0.6,
          label: i < NODE_LABELS.length ? NODE_LABELS[i].toUpperCase() : null,
          lw: 0,
          vis: 0,
        });
      }
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
      ctx.font = FONT;
      for (const p of particles) if (p.label) p.lw = ctx.measureText(p.label).width;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      readZones();
      const scroll = window.scrollY * 0.05;
      let overlaps = 0;
      for (const p of particles) {
        const y = p.y - scroll;
        const blocked = p.label
          ? hits(p.x - 4, y - 9, p.x + 8 + p.lw, y + 6)
          : hits(p.x - p.r - 2, y - p.r - 2, p.x + p.r + 2, y + p.r + 2);
        p.vis = blocked ? 0 : Math.min(1, p.vis + 0.04);
      }
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (!a.vis) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (!b.vis) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 - scroll;
          if (d < 130 && !hits(mx - 1, my - 1, mx + 1, my + 1)) {
            ctx.strokeStyle = `rgba(239,233,223,${(1 - d / 130) * 0.09 * Math.min(a.vis, b.vis)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y - scroll);
            ctx.lineTo(b.x, b.y - scroll);
            ctx.stroke();
          }
        }
      }
      ctx.font = FONT;
      for (const p of particles) {
        if (!p.vis) continue;
        const y = p.y - scroll;
        if (p.label) {
          if (hits(p.x - 4, y - 9, p.x + 8 + p.lw, y + 6)) overlaps++;
          ctx.fillStyle = `rgba(216,194,156,${0.6 * p.vis})`;
          ctx.beginPath();
          ctx.arc(p.x, y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(239,233,223,${0.36 * p.vis})`;
          ctx.fillText(p.label, p.x + 8, y + 3);
        } else {
          ctx.fillStyle = `rgba(239,233,223,${0.22 * p.vis})`;
          ctx.beginPath();
          ctx.arc(p.x, y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // read by the smoke test
      canvas.dataset.zones = String(zones.length);
      canvas.dataset.overlaps = String(overlaps);
    }

    function step() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 160 && md > 0.1) {
          p.vx += (mdx / md) * 0.01;
          p.vy += (mdy / md) * 0.01;
        }
        p.vx = Math.max(-0.25, Math.min(0.25, p.vx));
        p.vy = Math.max(-0.25, Math.min(0.25, p.vy));
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    // reduced motion: no animation, so redraw (and re-check the zones) on scroll and after the boot
    const still = () => {
      for (const p of particles) p.vis = 1;
      draw();
    };
    let late = 0;
    resize();
    if (reduced) {
      still();
      late = window.setTimeout(still, 2500);
      window.addEventListener("scroll", still, { passive: true });
    } else raf = requestAnimationFrame(step);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      window.removeEventListener("scroll", still);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      data-testid="particle-field-canvas"
    />
  );
}
