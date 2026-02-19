/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      textColor: {
        skin: {
          base: "rgb(var(--color-text-base) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          inverted: "rgb(var(--color-fill) / <alpha-value>)",
        },
      },
      backgroundColor: {
        skin: {
          fill: "rgb(var(--color-fill) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          inverted: "rgb(var(--color-text-base) / <alpha-value>)",
          card: "rgb(var(--color-card) / <alpha-value>)",
          "card-muted": "rgb(var(--color-card-muted) / <alpha-value>)",
        },
      },
      outlineColor: {
        skin: {
          fill: "rgb(var(--color-fill) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
        },
      },
      borderColor: {
        skin: {
          line: "rgb(var(--color-border) / <alpha-value>)",
          fill: "rgb(var(--color-fill) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
        },
      },
      fill: {
        skin: {
          base: "rgb(var(--color-text-base) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
        },
        transparent: "transparent",
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
