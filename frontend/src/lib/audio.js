let ctx = null;
let master = null;
let noiseBuf = null;
let muted = false;

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.1;
}

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.1;
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(type, freq, dur, vol, freqEnd) {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + dur);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g);
  g.connect(master);
  o.start();
  o.stop(c.currentTime + dur + 0.02);
}

export const tick = () => tone("square", 1800, 0.05, 0.04);
export const blip = () => tone("sine", 620, 0.12, 0.09, 920);
export const scrollTick = () => tone("square", 1400, 0.03, 0.025);
export const openChime = () => {
  tone("sine", 523.25, 0.22, 0.08);
  setTimeout(() => tone("sine", 784, 0.3, 0.08), 90);
};
export const errorTone = () => {
  tone("square", 160, 0.12, 0.07);
  setTimeout(() => tone("square", 120, 0.16, 0.07), 140);
};
export const bootChord = () => {
  tone("sine", 110, 1.1, 0.1);
  tone("sine", 165, 1.0, 0.07);
  setTimeout(() => tone("sine", 330, 0.8, 0.05), 200);
};
export const whoosh = () => {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(220, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(1400, c.currentTime + 0.4);
  f.Q.value = 1.4;
  const g = c.createGain();
  g.gain.setValueAtTime(0.11, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.5);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start();
};
