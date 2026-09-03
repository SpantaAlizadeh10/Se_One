import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1C2B44",
        ink70: "#4A5670",
        gold: "#C6952E",
        goldDeep: "#A67A1E",
        goldSoft: "#F3E4C2",
        sage: "#E7F0E2",
        sageDeep: "#4E7D5C",
        peach: "#FBEAD8",
        peachDeep: "#E7A467",
        cream: "#FAF8F3",
        line: "#EDE8DE",
        muted: "#8A8171",
        blue: "#3D5FE0",
        blueDeep: "#2E48B8",
        danger: "#D95A4B"
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Helvetica", "Arial", "sans-serif"]
      },
      borderRadius: {
        lg: "22px",
        md: "16px",
        sm: "10px"
      },
      boxShadow: {
        card: "0 2px 4px rgba(28,43,68,0.04), 0 12px 28px -14px rgba(28,43,68,0.14)",
        cardHover: "0 18px 34px -16px rgba(28,43,68,0.22)"
      }
    }
  },
  plugins: []
};

export default config;
