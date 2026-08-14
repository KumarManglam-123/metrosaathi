import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        metro: {
          purple: {
            DEFAULT: "#78288C",
            light: "#9A3FB3",
            dark: "#571666",
            glow: "rgba(120, 40, 140, 0.4)",
          },
          green: {
            DEFAULT: "#008A3B",
            light: "#00B04C",
            dark: "#00632A",
            glow: "rgba(0, 138, 59, 0.4)",
          },
          yellow: {
            DEFAULT: "#F5A623",
            light: "#FFC043",
            dark: "#C68212",
            glow: "rgba(245, 166, 35, 0.4)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        trainTravel: {
          "0%": { offsetDistance: "0%" },
          "100%": { offsetDistance: "100%" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
