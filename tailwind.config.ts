import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gm-lime":    "#c8f000",
        "gm-black":   "#0a0a0a",
        "gm-surface": "#111111",
        "gm-surface2":"#1a1a1a",
        "gm-surface3":"#222222",
        "gm-white":   "#f5f5f5",
        "gm-gray":    "#888888",
        "gm-teal":    "#00c8a0",
        "gm-red":     "#ff4444",
      },
      fontFamily: {
        italianno:        ["var(--font-italianno)"],
        display:          ["var(--font-barlow-condensed)", "'Barlow Condensed'", "sans-serif"],
        body:             ["var(--font-barlow)", "Barlow", "sans-serif"],
        "space-mono":     ["var(--font-space-mono)", "'Space Mono'", "monospace"],
        "barlow-cond":    ["var(--font-barlow-condensed)", "'Barlow Condensed'", "sans-serif"],
        barlow:           ["var(--font-barlow)", "Barlow", "sans-serif"],
      },
      animation: {
        "bounce-in":    "bounceIn 0.5s ease-out",
        "lime-pulse":   "limePulse 2s ease-in-out infinite",
        "dot-blink":    "dotBlink 1.5s ease-in-out infinite",
        "logo-float":   "logoFloat 4s ease-in-out infinite",
        "score-pulse":  "scorePulse 1s ease-in-out 3",
        "scan-line":    "scanLine 2s linear infinite",
        "fade-up":      "fadeUp 0.5s ease both",
        shimmer:        "shimmer 3s linear infinite",
      },
      keyframes: {
        bounceIn: {
          "0%":   { transform: "scale(0.3)", opacity: "0" },
          "50%":  { transform: "scale(1.05)" },
          "70%":  { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        limePulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(200,240,0,0.3)" },
          "50%":      { boxShadow: "0 0 24px rgba(200,240,0,0.7)" },
        },
        dotBlink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.2" },
        },
        logoFloat: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-4px) rotate(1deg)" },
          "66%":      { transform: "translateY(-2px) rotate(-1deg)" },
        },
        scorePulse: {
          "0%, 100%": { color: "#f5f5f5" },
          "50%":      { color: "#c8f000" },
        },
        scanLine: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      boxShadow: {
        "lime-sm": "0 4px 16px rgba(200,240,0,0.15)",
        "lime-md": "0 8px 32px rgba(200,240,0,0.25)",
        "lime-lg": "0 16px 64px rgba(200,240,0,0.35)",
        "gm-card": "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,240,0,0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backgroundImage: {
        "lime-gradient": "linear-gradient(135deg, #c8f000 0%, #a0d400 100%)",
        "dark-gradient": "linear-gradient(135deg, #111 0%, #1a1a1a 100%)",
        "lime-shimmer":  "linear-gradient(90deg, transparent 0%, rgba(200,240,0,0.15) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
