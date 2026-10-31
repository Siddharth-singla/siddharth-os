// What to tell people about dictating with Wispr Flow on their device.
export function dictationHint() {
  if (typeof navigator === "undefined") return "Type a command, or tap the mic.";
  const ua = navigator.userAgent || "";
  const plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
  if (/android|iphone|ipad|ipod/i.test(ua)) return "Tap the mic, or dictate with your keyboard's voice input.";
  if (/mac/i.test(plat)) return "Using Wispr Flow? Click the box and hold Fn to talk. Or tap the mic.";
  if (/win/i.test(plat)) return "Using Wispr Flow? Click the box and hold Ctrl + Win to talk. Or tap the mic.";
  return "Type a command, dictate it, or tap the mic.";
}

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

export const speechSupported = () =>
  typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
