import { useEffect, useRef } from "react";

// A waveform that comes alive while the system is listening.
// `energy` is a counter the voice engine bumps whenever speech is detected
// (speech start, each partial transcript), so the wave swells as you talk and
// settles when you stop. It never opens a second microphone stream, because
// some phones refuse to share the mic between this and speech recognition.
export default function VoiceWave({ active, energy = 0, height = 56, className = "", color = "34,197,94" }) {
  const ref = useRef(null);
  const amp = useRef(0.06);
  const target = useRef(0.06);
  const lastEnergy = useRef(energy);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
    target.current = active ? 0.35 : 0.06;
  }, [active]);

  useEffect(() => {
    if (energy !== lastEnergy.current) {
      lastEnergy.current = energy;
      target.current = Math.min(1, target.current + 0.45);
    }
  }, [energy]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (time) => {
      const t = time / 1000;
      const floor = activeRef.current ? 0.3 : 0.06;
      target.current += (floor - target.current) * 0.03;
      amp.current += (target.current - amp.current) * 0.12;
      g.clearRect(0, 0, w, h);
      const mid = h / 2;
      const layers = [
        { a: 1, f: 1.6, s: 2.2, alpha: 0.95, lw: 1.6 },
        { a: 0.65, f: 2.4, s: -1.6, alpha: 0.45, lw: 1.1 },
        { a: 0.4, f: 3.3, s: 3.1, alpha: 0.25, lw: 1 },
      ];
      for (const L of layers) {
        g.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const u = x / w;
          const env = Math.pow(Math.sin(Math.PI * u), 1.6);
          const y =
            mid +
            Math.sin(u * Math.PI * 2 * L.f + t * L.s) *
              Math.cos(u * Math.PI * 1.3 - t * 0.7) *
              env *
              amp.current *
              L.a *
              (h * 0.46);
          if (x === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.strokeStyle = `rgba(${color},${L.alpha * (0.45 + amp.current)})`;
        g.lineWidth = L.lw;
        g.stroke();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color]);

  return <canvas ref={ref} aria-hidden="true" className={`block w-full ${className}`} style={{ height }} />;
}
