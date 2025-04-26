/** @type {import('tailwindcss').Config} */

import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        custom: "0 2px 5px 0 rgba(0, 0, 0, 0.1)", // Adjust the RGBA value for desired opacity
      },
      keyframes: {
        keypad: {
          "0%": { opacity: "0", transform: "translateY(-10px) scaleY(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scaleY(1)" },
        },
        keypadExit: {
          "0%": { opacity: "1", transform: "translateY(0) scaleY(1)" },
          "100%": { opacity: "0", transform: "translateY(-1rem) scaleY(0.8)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        keypad: "keypad 0.2s ease-out forwards",
        keypadExit: "keypadExit 1s ease-in forwards", // ⏱ longer
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
