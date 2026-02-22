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
        emerald: {
          DEFAULT: "#047857",
          dark: "#065f46",
          light: "#10b981",
        },
        gold: {
          DEFAULT: "#d4af37",
          bright: "#ffd700",
          dark: "#b8960f",
        },
        cream: {
          DEFAULT: "#fffbf5",
        },
        slate: {
          DEFAULT: "#1e293b",
          light: "#475569",
        },
        amber: "#f59e0b",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        logo: ["var(--font-italiana)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
