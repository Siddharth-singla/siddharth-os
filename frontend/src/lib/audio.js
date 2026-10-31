// UI sound palette. Every sound is synthesised live with the Web Audio API
// (nothing is pre-recorded) and every note comes from D major pentatonic,
// so any combination of clicks, commands and world changes stays in tune.

let ctx = null;
let master = null;
let reverbSend = null;
let noiseBuf = null;
let muted = false;

const MASTER = 0.16;

// D major pentatonic
const N = {
  D3: 146.83, A3: 220.0,
  D4: 293.66, E4: 329.63, Fs4: 369.99, A4: 440.0, B4: 493.88,
  D5: 587.33, E5: 659.25, Fs5: 739.99, A5: 880.0, B5: 987.77, D6: 1174.66,
};

export function setMuted(m) {
  muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : MASTER, ctx.currentTime, 0.05);
}

function impulse(c, seconds, decay) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

// Browsers only allow audio after the visitor has clicked, tapped or pressed a key.
// Hovering doesn't count, so stay silent until then (instead of creating a blocked AudioContext).
function allowed() {
  const ua = typeof navigator !== "undefined" ? navigator.userActivation : null;
  return !ua || ua.hasBeenActive;
}

function ensure() {
  if (!allowed()) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    comp.connect(ctx.destination);

    master = ctx.createGain();
    master.gain.value = muted ? 0 : MASTER;
    const tone = ctx.createBiquadFilter(); // takes the edge off every sound
    tone.type = "lowpass";
    tone.frequency.value = 5200;
    master.connect(tone);
    tone.connect(comp);

    const verb = ctx.createConvolver();
    verb.buffer = impulse(ctx, 2.4, 2.6);
    reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.32;
    reverbSend.connect(verb);
    verb.connect(master);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// A soft note: gentle attack, exponential release, part of it sent to the reverb.
function note(freq, { dur = 0.4, vol = 0.1, type = "sine", attack = 0.008, when = 0, wet = 1, detune = 0 } = {}) {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  o.detune.value = detune;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + dur);
  o.connect(g);
  g.connect(master);
  if (wet > 0) {
    const s = c.createGain();
    s.gain.value = wet;
    g.connect(s);
    s.connect(reverbSend);
  }
  o.start(t0);
  o.stop(t0 + attack + dur + 0.05);
}

// A warm two-oscillator pad (slightly detuned, slow attack).
function pad(freq, { dur = 1.6, vol = 0.05, when = 0 } = {}) {
  note(freq, { dur, vol, type: "triangle", attack: 0.25, when, detune: -6 });
  note(freq, { dur, vol: vol * 0.8, type: "sine", attack: 0.3, when, detune: 7 });
}

// --- interface sounds ---
export const tick = () => note(N.A5, { dur: 0.05, vol: 0.018, type: "triangle", wet: 0.3 });
export const scrollTick = () => note(N.D6, { dur: 0.04, vol: 0.012, type: "sine", wet: 0.4 });
export const blip = () => {
  note(N.E5, { dur: 0.12, vol: 0.05 });
  note(N.A5, { dur: 0.22, vol: 0.045, when: 0.06 });
};
export const openChime = () => {
  note(N.D5, { dur: 0.3, vol: 0.06 });
  note(N.A5, { dur: 0.45, vol: 0.05, when: 0.09 });
};
export const errorTone = () => {
  note(N.B4, { dur: 0.2, vol: 0.05, type: "triangle" });
  note(N.Fs4, { dur: 0.35, vol: 0.05, type: "triangle", when: 0.12 });
};
export const replyChime = () => {
  note(N.D5, { dur: 0.18, vol: 0.035 });
  note(N.Fs5, { dur: 0.18, vol: 0.03, when: 0.07 });
  note(N.A5, { dur: 0.4, vol: 0.03, when: 0.14 });
};
export const listenStart = () => {
  note(N.A4, { dur: 0.15, vol: 0.05 });
  note(N.D5, { dur: 0.3, vol: 0.05, when: 0.08 });
};
export const listenStop = () => {
  note(N.D5, { dur: 0.15, vol: 0.04 });
  note(N.A4, { dur: 0.3, vol: 0.04, when: 0.08 });
};

export const bootChord = () => {
  pad(N.D3, { dur: 2.4, vol: 0.06 });
  pad(N.A3, { dur: 2.2, vol: 0.045, when: 0.05 });
  [N.D4, N.Fs4, N.A4, N.D5, N.E5].forEach((f, i) =>
    note(f, { dur: 0.9, vol: 0.04, when: 0.25 + i * 0.11 })
  );
};

// Each world has its own note, so moving between worlds plays a melody.
const WORLD_NOTES = {
  hero: N.D4, about: N.E4, map: N.Fs4, voice: N.A4, build: N.D5, modules: N.D5,
  source: N.E5, lab: N.Fs5, play: N.A5, mind: N.B4, timeline: N.E5, future: N.A5, final: N.D5,
};
export const worldNote = (section) => {
  const f = WORLD_NOTES[section] || N.D5;
  note(f / 2, { dur: 0.9, vol: 0.035, type: "triangle", attack: 0.04 });
  note(f, { dur: 0.7, vol: 0.04, when: 0.05 });
};

export const whoosh = () => {
  if (muted) return;
  const c = ensure(); // null before the first click or tap
  if (!c) return;
  const t0 = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(260, t0);
  f.frequency.exponentialRampToValueAtTime(1600, t0 + 0.5);
  f.Q.value = 0.9;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  g.connect(reverbSend);
  src.start(t0);
};

// "Play some music": a short phrase in the same key, about 5 seconds long.
export const playMotif = () => {
  const phrase = [
    [N.D4, 0], [N.A4, 0.3], [N.Fs5, 0.6], [N.E5, 0.9], [N.D5, 1.2], [N.A4, 1.5],
    [N.B4, 1.95], [N.D5, 2.25], [N.E5, 2.55], [N.Fs5, 2.85], [N.A5, 3.15], [N.D5, 3.6],
  ];
  pad(N.D3, { dur: 2.2, vol: 0.05 });
  pad(N.A3, { dur: 2.0, vol: 0.035 });
  pad(146.83 * (493.88 / 293.66), { dur: 2.2, vol: 0.04, when: 1.9 }); // B2 (relative minor)
  pad(N.D3, { dur: 2.4, vol: 0.05, when: 3.4 });
  phrase.forEach(([f, w]) => note(f, { dur: 0.7, vol: 0.05, when: w, type: "sine" }));
};
