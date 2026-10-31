/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Warm monochrome palette: Caviar #010101, Charcoal #312E2E, Shadow #4E4949,
      // Saddle #5C5551, Mustang #807D7D, plus derived light tones of the same hue.
      // Values live in CSS variables (src/index.css) so each section tone can retune
      // surface, panel and secondary text while keeping contrast at WCAG AA or better.
      colors: {
        void: "rgb(var(--c-void) / <alpha-value>)", // Caviar, the darkest tone
        surface: "rgb(var(--c-surface) / <alpha-value>)", // background of the current section
        panel: "rgb(var(--c-panel) / <alpha-value>)", // raised card, one step lighter
        ink: "rgb(var(--c-ink) / <alpha-value>)", // primary text, "Bone"
        dim: "rgb(var(--c-dim) / <alpha-value>)", // secondary text, tuned per section
        faint: "rgb(var(--c-faint) / <alpha-value>)", // labels and metadata, tuned per section
        osc: "rgb(var(--c-accent) / <alpha-value>)", // the one accent, "Sand" (Saddle's hue, lighter)
        line: "rgb(var(--c-line) / <alpha-value>)", // Mustang, for outlines and rules
        warn: "rgb(var(--c-warn) / <alpha-value>)",
        err: "rgb(var(--c-err) / <alpha-value>)"
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        monoos: ["JetBrains Mono", "monospace"],
        serif: ["Instrument Serif", "serif"]
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

