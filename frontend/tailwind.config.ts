import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        shine: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        marquee: {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.6s ease-out both",
        "fade-in":    "fade-in 0.5s ease-out both",
        float:        "float 4s ease-in-out infinite",
        shine:        "shine 3s linear infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        marquee:      "marquee 25s linear infinite",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1445 100%)",
        "card-shine":    "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
      },
      boxShadow: {
        "card-hover": "0 20px 60px -10px rgba(0,0,0,0.15)",
        "product":    "0 4px 20px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
