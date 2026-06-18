import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07090C",
        bg2: "#0C1014",
        surface: "#11151B",
        surface2: "#161C24",
        surface3: "#1C2430",
        ink: "#EBF1F6",
        muted: "#A4B1BE",
        faint: "#637180",
        accent: "#22D3EE",
        accent2: "#06B6D4",
        "accent-deep": "#0E7490",
        "accent-ink": "#67E8F9",
        ok: "#34D399",
        line: "rgba(255,255,255,0.08)",
        line2: "rgba(255,255,255,0.16)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: { content: "1200px" },
      borderRadius: { xl2: "20px" },
    },
  },
  plugins: [],
} satisfies Config;
