import type { Config } from "tailwindcss";

/**
 * Ustaad.com design tokens — matches the Color Scheme & Usage Guide v1.0.
 * Do not add ad-hoc hex values in components. Use these tokens.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#14213D",       // primary brand — headers, primary buttons
        ochre: "#B5651D",      // signature accent — match scores, standout CTAs ONLY
        green: "#3A5A40",      // success / verified / accepted states ONLY
        paper: "#FBFAF7",      // app background
        ink: "#1C1C1C",        // primary text
        slate: "#6B6B6B",      // secondary/muted text
        hairline: "#E2DED2",   // borders & dividers
        "navy-tint": "#E8ECF2",
        "ochre-tint": "#FDF0E2",
        "green-tint": "#E9F2EA",
        "error-tint": "#F5E6E6",
        "neutral-tint": "#ECE8DC",
        "error-text": "#9C3B3B",
        "error-border": "#E3B6B6",
        "disabled-text": "#B0AA98",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
