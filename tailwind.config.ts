import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy:       "#1B3A6B",
          "navy-dark":  "#12274A",
          "navy-light": "#2A4F8A",
          gold:       "#D4A017",
          "gold-light": "#E8BC3C",
          "gold-dark":  "#A87D10",
          red:        "#C84B31",
          cream:      "#F8F7F4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "slide-up":      "slide-up 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
        "slide-down":    "slide-down 0.2s ease-out",
        "fade-in":       "fade-in 0.2s ease-out",
        "fade-in-up":    "fade-in-up 0.35s ease-out both",
        "scale-in":      "scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
        "shimmer":       "shimmer 1.8s linear infinite",
        "bounce-gentle": "bounce-gentle 2.5s ease-in-out infinite",
        "pulse-ring":    "pulse-ring 1.5s ease-out infinite",
        "ken-burns":     "ken-burns 24s ease-in-out infinite alternate",
        "float-slow":    "float-slow 14s ease-in-out infinite",
        "float-slower":  "float-slow 20s ease-in-out infinite",
      },
      keyframes: {
        "ken-burns": {
          "0%":   { transform: "scale(1) translate(0, 0)" },
          "100%": { transform: "scale(1.12) translate(-1.5%, -1.5%)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%":      { transform: "translate(20px, -30px)" },
        },
        "slide-up": {
          "0%":   { transform: "translateY(120%)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "slide-down": {
          "0%":   { transform: "translateY(-6px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(1)",   opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      boxShadow: {
        // Ultra-light — content speaks, not shadows
        "card":       "0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 24px rgba(0,0,0,0.08)",
        "glass":      "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glow-gold":  "0 0 20px rgba(212,160,23,0.35)",
        "glow-navy":  "0 0 20px rgba(27,58,107,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
