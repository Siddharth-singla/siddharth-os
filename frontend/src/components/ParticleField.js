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
          label: i < NODE_LABELS.length ? NODE_LABELS[i] : null,
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
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY * 0.05;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(239,233,223,${(1 - d / 130) * 0.09})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y - scroll);
            ctx.lineTo(b.x, b.y - scroll);
            ctx.stroke();
          }
        }
      }
      ctx.font = "10px 'JetBrains Mono', monospace";
      for (const p of particles) {
        const y = p.y - scroll;
        if (p.label) {
          ctx.fillStyle = "rgba(216,194,156,0.6)";
          ctx.beginPath();
          ctx.arc(p.x, y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(239,233,223,0.36)";
          ctx.fillText(p.label.toUpperCase(), p.x + 8, y + 3);
        } else {
          ctx.fillStyle = "rgba(239,233,223,0.22)";
          ctx.beginPath();
          ctx.arc(p.x, y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
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

    resize();
    if (reduced) draw();
    else raf = requestAnimationFrame(step);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
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
