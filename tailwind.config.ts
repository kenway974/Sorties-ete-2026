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
        // ── Le fond ──────────────────────────────────────────────────────────
        // Encre prune plutôt que noir : la couleur y respire mieux, et les six
        // teintes des curiosités ressortent sans se battre entre elles.
        ink: {
          DEFAULT: "#1B1425",
          deep:    "#0F0A16",
          soft:    "#2C2138",
          veil:    "#3A2C4A",
        },
        // Papier, pas blanc : le blanc pur écrase les tons chauds.
        parchment: {
          DEFAULT: "#FAF5EC",
          dim:     "#F2E9D9",
          deep:    "#E6D8C0",
        },
        // ── Les six curiosités ───────────────────────────────────────────────
        // Une teinte par curiosité, franchement séparées sur la roue.
        frisson:  { DEFAULT: "#E4383F", light: "#FF6B70", deep: "#8E1620" },
        secret:   { DEFAULT: "#0E8A6E", light: "#12B48F", deep: "#064E3F" },
        metier:   { DEFAULT: "#D97A26", light: "#F2A03D", deep: "#8A4409" },
        scene:    { DEFAULT: "#8B45D6", light: "#A96BF0", deep: "#4C1D95" },
        temps:    { DEFAULT: "#3B62D9", light: "#5B84F5", deep: "#1E3A8A" },
        bizarre:  { DEFAULT: "#D6288F", light: "#F056A5", deep: "#831843" },

        // ── Accent ───────────────────────────────────────────────────────────
        gold: {
          DEFAULT: "#C9A227",
          light:   "#EBCF63",
          deep:    "#8A6D12",
        },

        // Anciens jetons, réaffectés à la nouvelle palette : un seul endroit à
        // changer pour repeindre les écrans pas encore repris à la main.
        brand: {
          navy:         "#1B1425",
          "navy-dark":  "#0F0A16",
          "navy-light": "#2C2138",
          gold:         "#C9A227",
          "gold-light": "#EBCF63",
          "gold-dark":  "#8A6D12",
          red:          "#E4383F",
          cream:        "#FAF5EC",
        },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
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
        "sheen":         "sheen 2.8s ease-in-out infinite",
        "reveal":        "reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "deal":          "deal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        "spin-slow":     "spin 9s linear infinite",
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
        "sheen": {
          "0%, 100%": { opacity: "0.35" },
          "50%":      { opacity: "1" },
        },
        "reveal": {
          "0%":   { opacity: "0", transform: "translateY(24px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        // La roulette : la carte suivante est « distribuée » depuis le dessous.
        "deal": {
          "0%":   { opacity: "0", transform: "translateY(40px) rotate(-2.5deg) scale(0.94)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(0deg) scale(1)" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(1)",   opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      boxShadow: {
        "card":       "0 1px 2px rgba(15,10,22,0.05), 0 2px 10px rgba(15,10,22,0.05)",
        "card-hover": "0 8px 32px rgba(15,10,22,0.12)",
        "glass":      "0 2px 16px rgba(15,10,22,0.08), inset 0 1px 0 rgba(255,255,255,0.12)",
        "glow-gold":  "0 0 28px rgba(201,162,39,0.4)",
        "glow-navy":  "0 0 28px rgba(27,20,37,0.35)",
        // Relief de vitrine : la carte pose sur le fond au lieu d'y flotter.
        "vitrine":    "0 18px 50px -12px rgba(15,10,22,0.45), 0 2px 6px rgba(15,10,22,0.18)",
      },
      backgroundImage: {
        // Grain de papier, en SVG inline : aucune requête réseau.
        "grain":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.42'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
