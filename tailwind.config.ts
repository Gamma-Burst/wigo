import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Satoshi", "system-ui", "sans-serif"],
        display: ["'Libre Caslon Text'", "Georgia", "serif"],
        body: ["Satoshi", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        background: "var(--background)",
        "background-warm": "var(--background-warm)",
        foreground: "var(--foreground)",
        "foreground-soft": "var(--foreground-soft)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
          glow: "var(--accent-glow)",
        },
        forest: {
          DEFAULT: "var(--forest)",
          light: "var(--forest-light)",
        },
        muted: "var(--muted)",
        card: "var(--card)",
        "card-hover": "var(--card-hover)",
        "surface-raised": "var(--surface-raised)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
        strong: "var(--border-strong)",
      },
      animation: {
        "slide-up": "slideUp 0.5s var(--ease-spring) both",
        "fade-in": "fadeIn 0.35s ease both",
        "scale-in": "scaleIn 0.4s var(--ease-spring) both",
      },
      keyframes: {
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      transitionTimingFunction: {
        "ease-out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      boxShadow: {
        "card-rest": "0 1px 3px oklch(0.18 0.015 60 / 0.04), 0 1px 2px oklch(0.18 0.015 60 / 0.03)",
        "card-hover": "0 16px 48px -12px oklch(0.18 0.015 60 / 0.1), 0 4px 12px -2px oklch(0.18 0.015 60 / 0.06)",
        "card-active": "0 4px 12px -4px oklch(0.18 0.015 60 / 0.08)",
        "nav": "0 4px 24px -4px oklch(0.18 0.015 60 / 0.08), 0 1px 2px oklch(0.18 0.015 60 / 0.04)",
        "input-focus": "0 0 0 3px var(--accent-subtle)",
        "btn-accent": "0 2px 8px oklch(0.62 0.2 38 / 0.2)",
        "btn-accent-hover": "0 4px 16px oklch(0.62 0.2 38 / 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
