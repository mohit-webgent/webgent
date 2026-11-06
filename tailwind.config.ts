import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",
        "4xl": "2560px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        canvas: withAlpha("--color-canvas"),
        surface: {
          DEFAULT: withAlpha("--color-surface"),
          2: withAlpha("--color-surface-2"),
          3: withAlpha("--color-surface-3"),
        },
        fg: {
          DEFAULT: withAlpha("--color-fg"),
          soft: withAlpha("--color-fg-soft"),
          muted: withAlpha("--color-fg-muted"),
        },
        accent: {
          DEFAULT: withAlpha("--color-accent"),
          hover: withAlpha("--color-accent-hover"),
          fg: withAlpha("--color-accent-fg"),
        },
        success: withAlpha("--color-success"),
        whatsapp: "#25D366",
        line: {
          DEFAULT: "rgb(255 255 255 / 0.09)",
          strong: "rgb(255 255 255 / 0.17)",
        },

        // Compatibility tokens for shadcn-style utility names.
        border: "rgb(255 255 255 / 0.1)",
        background: withAlpha("--color-canvas"),
        foreground: withAlpha("--color-fg"),
        primary: { DEFAULT: withAlpha("--color-fg"), foreground: withAlpha("--color-canvas") },
        muted: { DEFAULT: withAlpha("--color-surface-2"), foreground: withAlpha("--color-fg-muted") },
        destructive: { DEFAULT: "#DC4C4C", foreground: "#FFFFFF" },

        // The admin screens use these scales throughout. Pointing them at the brand palette keeps
        // the admin in step with the site without overriding each class in CSS. Emerald only marks
        // positive states such as Published or Won, so it is a muted green rather than a neon one.
        emerald: {
          50: "#EEF5F0",
          100: "#D9E8DE",
          200: "#BAD5C3",
          300: "#A0C5AC",
          400: "#86B295",
          500: "#6A9A7B",
          600: "#537E62",
          700: "#42654E",
          800: "#334E3D",
          900: "#253A2D",
          950: "#14211A",
        },
        slate: {
          50: "#F8F7F3",
          100: "#F4F3EE",
          200: "#E0E0DA",
          300: "#C8C8C2",
          400: "#A6A6A0",
          500: "#96968F",
          600: "#7E7E78",
          700: "#2C2C30",
          800: "#222225",
          900: "#0C0C0D",
          950: "#040405",
        },
        indigo: {
          50: "#FFF3EB",
          100: "#FFE3D1",
          200: "#FFC6A3",
          300: "#FFA470",
          400: "#FF8038",
          500: "#F26A1F",
          600: "#D65510",
          700: "#AD420C",
          800: "#87340D",
          900: "#6B2B0E",
          950: "#3A1405",
        },
      },
      borderRadius: {
        pill: "9999px",
        card: "1rem",
      },
      boxShadow: {
        card: "0 1px 0 rgb(255 255 255 / 0.03) inset, 0 20px 40px -24px rgb(0 0 0 / 0.65)",
        lift: "0 1px 0 rgb(255 255 255 / 0.04) inset, 0 36px 70px -32px rgb(0 0 0 / 0.8)",
        glow: "0 0 0 1px rgb(242 106 31 / 0.3), 0 12px 28px -16px rgb(0 0 0 / 0.7)",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            "--tw-prose-invert-body": "rgb(var(--color-fg-soft))",
            "--tw-prose-invert-headings": "rgb(var(--color-fg))",
            "--tw-prose-invert-links": "rgb(var(--color-accent))",
            "--tw-prose-invert-bold": "rgb(var(--color-fg))",
            "--tw-prose-invert-code": "rgb(var(--color-fg))",
            "--tw-prose-invert-bullets": "rgb(var(--color-accent))",
            "--tw-prose-invert-counters": "rgb(var(--color-accent))",
            "--tw-prose-invert-hr": "rgb(255 255 255 / 0.1)",
            "--tw-prose-invert-quote-borders": "rgb(var(--color-accent))",
            "--tw-prose-invert-pre-bg": "rgb(var(--color-surface))",
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
