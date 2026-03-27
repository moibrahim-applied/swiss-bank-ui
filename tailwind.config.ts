import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bank: {
          bg: "#111827",
          surface: "#1F2937",
          elevated: "#374151",
          gold: "#C9A84C",
          "gold-dim": "#A68A3E",
          steel: "#64748B",
          emerald: "#059669",
          amber: "#D97706",
          crimson: "#DC2626",
          text: "#F1F5F9",
          "text-secondary": "#94A3B8",
          border: "#1F2937",
          "border-light": "#374151",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "scan-line": "scanLine 2s ease-in-out",
        "gold-shimmer": "goldShimmer 1.5s ease-in-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "draw-line": "drawLine 0.6s ease-out forwards",
        "fill-bar": "fillBar 1s ease-out forwards",
        "stamp": "stamp 0.15s ease-out forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-right": "slideRight 0.4s ease-out forwards",
        "counter": "counter 1s ease-out forwards",
        "orbit": "orbit 2s linear infinite",
      },
      keyframes: {
        scanLine: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100%)" },
        },
        goldShimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        drawLine: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        fillBar: {
          "0%": { width: "0%" },
          "100%": { width: "var(--fill-width, 100%)" },
        },
        stamp: {
          "0%": { transform: "scale(1.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
