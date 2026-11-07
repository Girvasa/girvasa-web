import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Website Design System Tokens
        primary: "#070235",
        "primary-container": "#1e1b4b",
        "on-primary": "#ffffff",
        "on-primary-container": "#8683ba",
        "primary-fixed": "#e3dfff",
        "primary-fixed-dim": "#c4c1fb",
        "on-primary-fixed": "#181445",
        "on-primary-fixed-variant": "#444173",

        secondary: "#006a61",
        "secondary-container": "#86f2e4",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#006f66",
        "secondary-fixed": "#89f5e7",
        "secondary-fixed-dim": "#6bd8cb",
        "on-secondary-fixed": "#00201d",
        "on-secondary-fixed-variant": "#005049",

        tertiary: "#000928",
        "tertiary-container": "#001d58",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#5382ff",
        "tertiary-fixed": "#dbe1ff",
        "tertiary-fixed-dim": "#b4c5ff",
        "on-tertiary-fixed": "#00174b",
        "on-tertiary-fixed-variant": "#003ea8",

        background: "#faf8ff",
        "on-background": "#131b2e",

        surface: "#faf8ff",
        "on-surface": "#131b2e",
        "surface-dim": "#d2d9f4",
        "surface-bright": "#faf8ff",
        "surface-variant": "#dae2fd",
        "on-surface-variant": "#47464f",
        "surface-tint": "#5b598c",
        "inverse-surface": "#283044",
        "inverse-on-surface": "#eef0ff",
        "inverse-primary": "#c4c1fb",

        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3ff",
        "surface-container": "#eaedff",
        "surface-container-high": "#e2e7ff",
        "surface-container-highest": "#dae2fd",

        outline: "#787680",
        "outline-variant": "#c8c5d0",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        // Civic Haven ERP - Primary Palette (Emerald Green #107A48)
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#107A48", // Civic Haven Primary
          700: "#0D623A",
          800: "#0B4C2D",
          900: "#06301D",
          950: "#021A0F",
        },
        // Civic Haven ERP - Secondary Palette (Slate Navy #1E293B)
        navy: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B", // Civic Haven Secondary
          900: "#0F172A",
          950: "#0B1C30",
        },
        // Civic Haven ERP - Tertiary Palette (Sea Teal #0D9488)
        teal: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488", // Civic Haven Tertiary
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        "space-2xl": "3rem",
        gutter: "1.5rem",
        "gutter-mobile": "1rem",
        margin: "2rem",
        "margin-mobile": "1rem",
      },
      fontSize: {
        "headline-xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["16px", { lineHeight: "24px", letterSpacing: "-0.005em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
        "label-sm": ["10px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "600" }],
        "currency-lg": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "currency-md": ["14px", { lineHeight: "20px", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "0.25rem", // 4px
        DEFAULT: "0.5rem", // 8px
        md: "0.75rem", // 12px
        lg: "1rem", // 16px
        xl: "1.5rem", // 24px
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
