import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0b0d",
        bg2: "#0d0f13",
        surface: "#15181e",
        surface2: "#1a1e25",
        ink: "#f4f6f8",
        muted: "#9aa4af",
        faint: "#6b7480",
        accent: "#7c83ff",
        accent2: "#a855f7",
        "accent-ink": "#cdd0ff",
        ok: "#34d399",
        line: "rgba(255,255,255,0.08)",
        line2: "rgba(255,255,255,0.14)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      maxWidth: { content: "1120px" },
      borderRadius: { xl2: "16px" },
    },
  },
  plugins: [],
} satisfies Config;
