// The degree as a 90-minute football match.
// ASSUMPTION (confirm): the degree runs from 1 Aug 2024 to 31 Jul 2028.
export const MATCH_START = new Date("2024-08-01T00:00:00+05:30");
export const MATCH_END = new Date("2028-07-31T23:59:59+05:30");

const MATCH_SECONDS = 90 * 60;

export function matchClock(now = new Date()) {
  const total = MATCH_END - MATCH_START;
  const p = Math.min(1, Math.max(0, (now - MATCH_START) / total));
  const s = Math.floor(p * MATCH_SECONDS);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  const half = p >= 1 ? "FULL TIME" : p >= 0.5 ? "2ND HALF" : "1ST HALF";
  return { text: `${mm}:${ss}`, minute: Math.floor(s / 60), half, progress: p };
}
