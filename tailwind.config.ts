import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        matte: {
          base: "#080808",
          black: "#0D0D0D",
          charcoal: "#111111",
          dark: "#161616",
          graphite: "#1D1D1D",
          elevated: "#232323",
          border: "rgba(255, 255, 255, 0.07)",
          "border-light": "rgba(255, 255, 255, 0.12)",
          "border-active": "rgba(255, 255, 255, 0.22)",
        },
        surface: {
          base: "#080808",
          1: "#111111",
          2: "#161616",
          3: "#1D1D1D",
          4: "#232323",
        },
        text: {
          primary: "#F5F5F3",
          secondary: "#D0D0CE",
          muted: "#909090",
          dim: "#666666",
        },
        offwhite: {
          DEFAULT: "#E8E8E6",
          hover: "#D6D6D4",
          soft: "#F5F5F3",
        },
      },
      borderRadius: {
        pill: "var(--radius-pill)",
        card: "var(--radius-card)",
        nested: "var(--radius-nested)",
        button: "var(--radius-button)",
        badge: "var(--radius-badge)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        DEFAULT: "0 10px 30px rgba(0, 0, 0, 0.4)",
        matte: "0 20px 60px rgba(0, 0, 0, 0.25)",
        panel: "0 1px 3px rgba(0, 0, 0, 0.3), 0 10px 40px rgba(0, 0, 0, 0.2)",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "quad-out": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "450ms",
      },
    },
  },
  plugins: [],
};

export default config;
