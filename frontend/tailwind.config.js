/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        void: "#07080A",
        ink: "#F2F0E9",
        dim: "#A1A1AA",
        faint: "#52525B",
        osc: "#22C55E",
        oscDim: "rgba(34, 197, 94, 0.15)",
        panel: "#0E1014",
        warn: "#E8B04B",
        err: "#E5534B",
        surface: "#0D0F12",
        surfaceElevated: "#13171D",
        borderSubtle: "rgba(255, 255, 255, 0.08)"
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

