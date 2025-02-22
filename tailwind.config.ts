import type { Config } from "tailwindcss";

const customColors = {
  gold: "#af8100",
  amber: {
    DEFAULT: "#DB8B00",
    dimmed: "#d38600",
  },
  red: {
    DEFAULT: "#ee3b3b",
    dimmed: "#ec2323",
  },
  green: {
    DEFAULT: "#0A8800",
  },
  blue: {
    DEFAULT: "#0a5ddc",
    dimmed: "#084db5",
  },
  gray: {
    DEFAULT: "#6c6c6c",
  },
  black: "#262626",
  lightgray: {
    DEFAULT: "#f0f0f0",
    dimmed: "#e5e5e5",
  },
  "glass-black": "#00000033", // used by Overlay.tsx
};

const spinnerAnimation = {
  keyframes: {
    rotate: {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
    dash: {
      "0%": { strokeDasharray: "1px, 200px", strokeDashoffset: "0" },
      "50%": { strokeDasharray: "100px, 200px", strokeDashoffset: "-15px" },
      "100%": {
        strokeDasharray: "100px, 200px",
        strokeDashoffset: "-125px",
      },
    },
  },
  animation: {
    rotate: "rotate 1.4s linear infinite",
    dash: "dash 1.4s ease-in-out infinite",
  },
};

const navigationLoadingIndicatorAnimation = {
  keyframes: {
    navigationLoadingIndicatorAnimation: {
      "0%": { transform: "translateX(-100%) scaleX(0.7)", opacity: "0.3" },
      "50%": { transform: "translateX(0) scaleX(1)", opacity: "1" },
      "100%": { transform: "translateX(100%) scaleX(0.7)", opacity: "0.3" },
    },
  },
  animation: {
    navigationLoadingIndicatorAnimation:
      "navigationLoadingIndicatorAnimation 1.4s infinite cubic-bezier(0.42, 0, 0.58, 1)",
  },
};

export default {
  content: [
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: customColors,
      stroke: { gray: customColors.gray },
      fill: { gray: customColors.gray },
      textColor: {
        gray: customColors.gray,
        amber: { DEFAULT: "#A86400" },
      },
      borderColor: { DEFAULT: "#dcdfe4" },
      boxShadow: {
        DEFAULT: "0px 1.8px 4px rgba(0,0,0,0.2), 0px 0px 3px rgba(0,0,0,0.1)",
        "thick-bottom": "#21212140 0px 3px 2px 0px, #E5E5E5 0px 0px 1px 1px",
        dropdown: "#00000040 0px 4px 8px -2px, #00000014 0px 0px 0px 1px",
      },
      keyframes: {
        ...spinnerAnimation.keyframes,
        ...navigationLoadingIndicatorAnimation.keyframes,
      },
      animation: {
        ...spinnerAnimation.animation,
        ...navigationLoadingIndicatorAnimation.animation,
      },
    },
  },
  plugins: [require("tailwindcss-animated")],
} satisfies Config;
