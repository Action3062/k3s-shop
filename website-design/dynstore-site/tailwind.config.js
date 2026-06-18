/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#07090C",
        elevated: "#0C1014",
        surface: { 1: "#11151B", 2: "#161C24", 3: "#1C2430" },
        ink: { DEFAULT: "#EBF1F6", soft: "#A4B1BE", dim: "#637180", on: "#04181C" },
        accent: {
          DEFAULT: "#22D3EE",
          strong: "#06B6D4",
          deep: "#0E7490",
          soft: "rgba(34,211,238,0.12)",
        },
        live: "#34D399",
        hair: {
          subtle: "rgba(255,255,255,0.06)",
          faint: "rgba(255,255,255,0.10)",
          strong: "rgba(255,255,255,0.16)",
          glow: "rgba(34,211,238,0.45)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: { card: "20px" },
      letterSpacing: { tightish: "-0.02em", widecaps: "0.12em" },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.45)",
        glow: "0 0 0 1px rgba(34,211,238,0.25), 0 12px 50px rgba(34,211,238,0.10)",
        "glow-strong": "0 8px 30px rgba(34,211,238,0.25)",
      },
      maxWidth: { content: "1200px" },
    },
  },
  plugins: [],
};
