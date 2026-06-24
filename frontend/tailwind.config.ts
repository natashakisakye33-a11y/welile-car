import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssForms from "@tailwindcss/forms";
import tailwindcssContainerQueries from "@tailwindcss/container-queries";
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
                        "on-background": "#0b1c30",
                        "secondary-fixed": "#f0dbff",
                        "surface-container-lowest": "#ffffff",
                        "surface-tint": "#7642b9",
                        "surface-container-high": "#dce9ff",
                        "tertiary-fixed-dim": "#2fe19d",
                        "on-surface": "#0b1c30",
                        "on-error": "#ffffff",
                        "surface-bright": "#f8f9ff",
                        "on-error-container": "#93000a",
                        "primary-container": "#4f1291",
                        "on-primary-fixed": "#290055",
                        "surface-container-highest": "#d3e4fe",
                        "on-secondary-fixed": "#2c0051",
                        "on-primary-fixed-variant": "#5d269f",
                        "outline-variant": "#cdc3d4",
                        "on-secondary": "#ffffff",
                        "surface-variant": "#d3e4fe",
                        "surface": "#f8f9ff",
                        "on-tertiary-container": "#00bb7f",
                        "on-tertiary": "#ffffff",
                        "inverse-primary": "#d8b9ff",
                        "surface-container-low": "#eff4ff",
                        "tertiary-fixed": "#58feb8",
                        "surface-container": "#e5eeff",
                        "outline": "#7c7483",
                        "tertiary": "#002b1a",
                        "primary-fixed-dim": "#d8b9ff",
                        "secondary-container": "#c284ff",
                        "surface-dim": "#cbdbf5",
                        "error": "#ba1a1a",
                        "secondary": "#7c3fb6",
                        "error-container": "#ffdad6",
                        "on-tertiary-fixed-variant": "#005235",
                        "tertiary-container": "#00432b",
                        "secondary-fixed-dim": "#ddb8ff",
                        "on-tertiary-fixed": "#002113",
                        "on-secondary-fixed-variant": "#63239c",
                        "on-surface-variant": "#4b4452",
                        "background": "#f8f9ff",
                        "primary": "#340068",
                        "on-primary": "#ffffff",
                        "on-secondary-container": "#52088c",
                        "inverse-surface": "#213145",
                        "inverse-on-surface": "#eaf1ff",
                        "primary-fixed": "#eddcff",
                        "on-primary-container": "#bd8cff"
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    spacing: {
                        "margin-desktop": "40px",
                        "margin-mobile": "16px",
                        "sidebar-width": "260px",
                        "gutter": "24px",
                        "card-padding": "24px",
                        "base": "8px"
                    },
                    fontFamily: {
                        "label-caps": ["Manrope"],
                        "headline-lg": ["Manrope"],
                        "body-sm": ["Manrope"],
                        "headline-md": ["Manrope"],
                        "headline-lg-mobile": ["Manrope"],
                        "body-lg": ["Manrope"],
                        "price-lg": ["Manrope"]
                    },
                    fontSize: {
                        "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
                        "headline-lg": ["36px", {"lineHeight": "1.2", "fontWeight": "700"}],
                        "body-sm": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
                        "headline-md": ["20px", {"lineHeight": "1.4", "fontWeight": "700"}],
                        "headline-lg-mobile": ["28px", {"lineHeight": "1.2", "fontWeight": "700"}],
                        "body-lg": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "price-lg": ["18px", {"lineHeight": "1", "fontWeight": "800"}]
                    },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        "count-up": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "progress-fill": "progress-fill 1.5s ease-out forwards",
      },
    },
  },
  plugins: [
    tailwindcssAnimate, 
    tailwindcssForms, 
    tailwindcssContainerQueries
  ],
} satisfies Config;
