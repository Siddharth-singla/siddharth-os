import { useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import avatarSrc from "../assets/avatar.jpg";

// soft elliptical mask so the photo's black background dissolves into the page
const MASK =
  "radial-gradient(ellipse 80% 80% at 50% 50%, black 58%, rgba(0,0,0,0.55) 78%, transparent 97%)";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function AvatarGrain({ progress, booted }) {
  const reduced = useReducedMotion();
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const partsRef = useRef(null);
  const targetRef = useRef(0);
  const curRef = useRef(-1);
  const rafRef = useRef(0);

  useMotionValueEvent(progress, "change", (v) => {
    targetRef.current = v;
  });

  const fade = useTransform(progress, [0, 0.8], [1, 0]);

  // sample the avatar's real pixels once — grains carry the image's own colours
  useEffect(() => {
    if (reduced) return;
    const img = imgRef.current;
    if (!img) return;
    const build = () => {
      try {
        const SW = 512;
        const off = document.createElement("canvas");
        off.width = SW;
        off.height = SW;
        const octx = off.getContext("2d", { willReadFrequently: true });
        octx.drawImage(img, 0, 0, SW, SW);
        const data = octx.getImageData(0, 0, SW, SW).data;
        const mobile = window.matchMedia("(max-width: 640px)").matches;
        const gap = mobile ? 6 : 4;
        const parts = [];
        for (let y = 0; y < SW; y += gap) {
          for (let x = 0; x < SW; x += gap) {
            const i = (y * SW + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (lum < 16) continue; // drop the black backdrop, keep subject + green rim
            const hx = x / SW;
            const hy = y / SW;
            const ang = Math.atan2(hy - 0.52, hx - 0.5) + (Math.random() - 0.5) * 1.2;
            const spd = 0.45 + Math.random() * 0.95;
            parts.push({
              hx, hy, r, g, b,
              dx: Math.cos(ang) * spd,
              dy: Math.sin(ang) * spd * 0.8 + 0.32,
              d0: Math.random() * 0.22,
              sz: 0.7 + Math.random() * 1.4,
            });
          }
        }
        partsRef.current = parts;
        curRef.current = -1; // force redraw with fresh particles
      } catch (e) {
        partsRef.current = null;
      }
    };
    if (img.complete && img.naturalWidth) build();
    else img.addEventListener("load", build, { once: true });
    return () => img.removeEventListener("load", build);
  }, [reduced]);

  // scroll-linked render loop: progress -> grain displacement (reversible)
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      curRef.current = -1;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = (q) => {
      const img = imgRef.current;
      if (img) img.style.opacity = String(clamp(1 - q * 8, 0, 1));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const parts = partsRef.current;
      if (!parts || !parts.length || q <= 0) return;
      const W = canvas.width;
      const H = canvas.height;
      for (let k = 0; k < parts.length; k++) {
        const p = parts[k];
        const local = clamp((q - p.d0) / (1 - p.d0), 0, 1);
        if (local <= 0 || local >= 1) continue;
        const e = local * local;
        const d = e * 1.05;
        const x = (p.hx + p.dx * d) * W;
        const y = (p.hy + p.dy * d) * H;
        if (x < -8 || x > W + 8 || y < -8 || y > H + 8) continue;
        const s = p.sz * (1 - local * 0.55) * dpr;
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${(1 - local) * 0.95})`;
        ctx.fillRect(x, y, s, s);
      }
    };

    const loop = () => {
      const t = targetRef.current;
      const c = curRef.current;
      if (c < 0 || Math.abs(t - c) > 0.0006) {
        const n = c < 0 ? t : c + (t - c) * 0.22;
        curRef.current = n;
        draw(n);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <motion.img
        src={avatarSrc}
        alt="Siddharth Singla"
        style={{ opacity: fade, WebkitMaskImage: MASK, maskImage: MASK }}
        className="h-full w-full object-cover select-none"
        draggable={false}
        data-testid="hero-avatar-static"
      />
    );
  }

  return (
    <div ref={wrapRef} className="relative h-full w-full" data-testid="hero-avatar">
      <img
        ref={imgRef}
        src={avatarSrc}
        alt="Siddharth Singla"
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable={false}
        data-testid="avatar-grain-image"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        data-testid="avatar-grain-canvas"
      />
    </div>
  );
}
