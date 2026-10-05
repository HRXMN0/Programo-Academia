/** @type {import('tailwindcss').Config} */

// Every themeable colour is wired to a CSS variable through the
// `rgb(var(--x) / <alpha-value>)` form. The `<alpha-value>` placeholder is what
// lets Tailwind emit `bg-primary/5` or `text-outline/50`; a bare `var(--x)`
// silently drops those utilities on the floor.
const themed = (name) => `rgb(var(--${name}) / <alpha-value>)`

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces
        "background": themed("bg"),
        "surface": themed("bg"),
        "surface-bright": themed("surface-bright"),
        "surface-dim": themed("surface-dim"),
        "surface-container-lowest": themed("card"),
        "surface-container-low": themed("surface-low"),
        "surface-container": themed("surface-low"),
        "surface-container-high": themed("surface-high"),
        "surface-container-highest": themed("surface-high"),
        "surface-variant": themed("surface-high"),
        "surface-tint": themed("secondary"),

        // Ink & lines
        "on-background": themed("text"),
        "on-surface": themed("text"),
        "on-surface-variant": themed("on-surface-variant"),
        "outline": themed("outline"),
        "outline-variant": themed("border"),

        // Primary — heading ink and high-emphasis fills
        "primary": themed("primary"),
        "on-primary": themed("on-primary"),
        "primary-container": themed("primary-container"),
        "on-primary-container": themed("on-primary-container"),

        // Secondary — the call-to-action colour
        "secondary": themed("secondary"),
        "on-secondary": themed("on-secondary"),
        "secondary-container": themed("secondary-container"),
        "on-secondary-container": themed("on-secondary-container"),

        // Tertiary — the second accent
        "tertiary": themed("tertiary"),
        "on-tertiary": themed("on-tertiary"),
        "tertiary-container": themed("tertiary-container"),
        "on-tertiary-container": themed("on-tertiary-container"),

        "error": themed("error"),
        "on-error": themed("on-error"),
        "error-container": themed("error-container"),
        "on-error-container": themed("on-error-container"),

        "inverse-surface": themed("inverse-surface"),
        "inverse-on-surface": themed("inverse-on-surface"),
        "inverse-primary": themed("inverse-primary"),

        // Material's "fixed" roles are theme-independent by definition, so they
        // stay literal. Hex parses fine with an alpha modifier.
        "primary-fixed": "#ccfbf1",
        "primary-fixed-dim": "#99f6e4",
        "on-primary-fixed": "#042f2e",
        "on-primary-fixed-variant": "#115e59",
        "secondary-fixed": "#5eead4",
        "secondary-fixed-dim": "#2dd4bf",
        "on-secondary-fixed": "#042f2e",
        "on-secondary-fixed-variant": "#115e59",
        "tertiary-fixed": "#e0e7ff",
        "tertiary-fixed-dim": "#c7d2fe",
        "on-tertiary-fixed": "#1e1b4b",
        "on-tertiary-fixed-variant": "#3730a3",

        // Per-topic accents, so a syllabus can be colour-coded instead of
        // presenting six identical grey cards.
        "topic-blue": "#3b82f6",
        "topic-violet": "#8b5cf6",
        "topic-amber": "#f59e0b",
        "topic-emerald": "#10b981",
        "topic-rose": "#f43f5e",
        "topic-cyan": "#06b6d4",
      },
      borderRadius: {
        // Was DEFAULT 2px / lg 4px / xl 8px / full 12px, which squared off every
        // pill button and every avatar on the site.
        "DEFAULT": "0.5rem",
        "sm": "0.375rem",
        "md": "0.625rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "full": "9999px"
      },
      spacing: {
        "xs": "4px",
        "base": "8px",
        "sm": "12px",
        "md": "24px",
        "gutter": "24px",
        "lg": "48px",
        "xl": "80px",
        "container-max": "1280px"
      },
      fontFamily: {
        "code-block": ["JetBrains Mono", "monospace"],
        "display-lg": ["Geist", "sans-serif"],
        "headline-lg": ["Geist", "sans-serif"],
        "label-md": ["Geist", "sans-serif"],
        "body-md": ["Geist", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"],
        "headline-sm": ["Geist", "sans-serif"],
        "headline-lg-mobile": ["Geist", "sans-serif"],
        "body-sm": ["Geist", "sans-serif"],
        "body-lg": ["Geist", "sans-serif"]
      },
      fontSize: {
        "code-block": ["14px", { lineHeight: "22px", fontWeight: "400" }],
        "display-lg": ["52px", { lineHeight: "58px", letterSpacing: "-0.035em", fontWeight: "800" }],
        "headline-lg": ["34px", { lineHeight: "42px", letterSpacing: "-0.025em", fontWeight: "700" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "26px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "700" }],
        "headline-sm": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "30px", fontWeight: "400" }],
        // Declared in fontFamily but previously missing here, so `text-body-sm`
        // was an undefined utility.
        "body-sm": ["14px", { lineHeight: "22px", fontWeight: "400" }]
      },
      boxShadow: {
        // A real elevation ramp. Two layers each: a tight contact shadow plus a
        // wide ambient one, which is what stops a card looking pasted on.
        "card": "0 1px 2px rgb(15 23 42 / 0.04), 0 4px 16px rgb(15 23 42 / 0.06)",
        "card-hover": "0 2px 4px rgb(15 23 42 / 0.06), 0 16px 40px rgb(15 23 42 / 0.10)",
        "lifted": "0 4px 8px rgb(15 23 42 / 0.05), 0 24px 56px rgb(15 23 42 / 0.12)",
        "brand": "0 4px 14px rgb(var(--secondary) / 0.30)",
        "brand-hover": "0 8px 24px rgb(var(--secondary) / 0.40)",
        "inset-hairline": "inset 0 1px 0 0 rgb(255 255 255 / 0.06)"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, rgb(var(--secondary)) 0%, rgb(var(--tertiary)) 100%)",
        "grid-fade":
          "linear-gradient(to right, rgb(var(--outline) / 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--outline) / 0.07) 1px, transparent 1px)"
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
}
