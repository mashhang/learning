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
    },
  },
  plugins: [],
} satisfies Config;
