import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest:  { DEFAULT: "#1a3a2a", 50: "#f0f7f2", 100: "#d6ead9", 200: "#aed4b5", 300: "#7db88a", 400: "#529963", 500: "#357a4a", 600: "#27603a", 700: "#1e4d2e", 800: "#163a22", 900: "#0d2615" },
        sage:    { DEFAULT: "#6b8c6e", 50: "#f4f7f4", 100: "#e2ebe3", 200: "#c3d5c5", 300: "#9bb99e", 400: "#6b8c6e", 500: "#527355", 600: "#405c43", 700: "#334934", 800: "#283928", 900: "#1e2b1e" },
        cream:   { DEFAULT: "#faf7f0", 50: "#fefcf9", 100: "#faf7f0", 200: "#f3ecdc", 300: "#e8dcc3", 400: "#d9c89e", 500: "#c4a96d", 600: "#a8883f", 700: "#876c2e", 800: "#6a5323", 900: "#52401b" },
        earth:   { DEFAULT: "#8b6914", 50: "#fdf8ee", 100: "#f9edd0", 200: "#f1d89c", 300: "#e7be60", 400: "#d9a030", 500: "#c4831a", 600: "#a86512", 700: "#8b4f0f", 800: "#6d3d10", 900: "#572f0f" },
        moss:    { DEFAULT: "#4a6741", 50: "#f3f7f2", 100: "#e0ecde", 200: "#bed8b9", 300: "#93be8c", 400: "#659e5c", 500: "#4a6741", 600: "#3a5233", 700: "#2e4028", 800: "#24321f", 900: "#1b2617" },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["'DM Sans'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.5rem" },
      boxShadow: {
        "soft":   "0 2px 20px rgba(26,58,42,0.06)",
        "card":   "0 4px 24px rgba(26,58,42,0.10)",
        "lifted": "0 12px 48px rgba(26,58,42,0.16)",
        "green":  "0 8px 32px rgba(26,58,42,0.24)",
      },
      backgroundImage: {
        "leaf-pattern": "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a6741' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-up":   "fadeUp 0.6s ease forwards",
        "fade-in":   "fadeIn 0.4s ease forwards",
        "slide-in":  "slideIn 0.5s ease forwards",
        "pulse-slow":"pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:  { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideIn: { from: { opacity: "0", transform: "translateX(-20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
