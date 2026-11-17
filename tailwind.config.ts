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
        // Theme-aware: white is the high-contrast ink and black its opposite, so they swap in light mode.
        white: withAlpha("--color-ink"),
        black: withAlpha("--color-shade"),
        line: {
          DEFAULT: "rgb(var(--color-ink) / 0.09)",
          strong: "rgb(var(--color-ink) / 0.17)",
        },

        // Compatibility tokens for shadcn-style utility names.
        border: "rgb(var(--color-ink) / 0.1)",
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
          50: withAlpha("--slate-50"),
          100: withAlpha("--slate-100"),
          200: withAlpha("--slate-200"),
          300: withAlpha("--slate-300"),
          400: withAlpha("--slate-400"),
          500: withAlpha("--slate-500"),
          600: withAlpha("--slate-600"),
          700: withAlpha("--slate-700"),
          800: withAlpha("--slate-800"),
          900: withAlpha("--slate-900"),
          950: withAlpha("--slate-950"),
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
      // Orange used as text needs a deeper shade on light backgrounds than orange used as a fill.
      textColor: {
        accent: {
          DEFAULT: withAlpha("--color-accent-text"),
        },
      },
      borderRadius: {
        pill: "9999px",
        card: "1rem",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        lift: "var(--shadow-lift)",
        glow: "var(--shadow-glow)",
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
            "--tw-prose-invert-hr": "rgb(var(--color-ink) / 0.1)",
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
