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
      "on-surface": "#131b2e",
      "surface": "#faf8ff",
      "secondary-fixed-dim": "#3cddc7",
      "outline-variant": "#cfc2d7",
      "tertiary-fixed": "#ffddb8",
      "surface-dim": "#d2d9f4",
      "surface-container-low": "#f2f3ff",
      "outline": "#7e7386",
      "tertiary-container": "#965e00",
      "on-primary-fixed": "#2c0051",
      "primary-fixed-dim": "#ddb8ff",
      "error-container": "#ffdad6",
      "on-primary-fixed-variant": "#6800b4",
      "primary-fixed": "#f0dbff",
      "surface-container": "#eaedff",
      "on-primary": "#ffffff",
      "inverse-primary": "#ddb8ff",
      "error": "#ba1a1a",
      "on-tertiary-fixed-variant": "#653e00",
      "on-secondary-fixed": "#00201c",
      "surface-container-high": "#e2e7ff",
      "on-surface-variant": "#4d4354",
      "tertiary-fixed-dim": "#ffb95f",
      "secondary-container": "#62fae3",
      "primary": "#4C158D",
      "tertiary": "#754900",
      "surface-tint": "#4C158D",
      "surface-container-highest": "#dae2fd",
      "on-error-container": "#93000a",
      "on-secondary-container": "#007165",
      "background": "#faf8ff",
      "inverse-on-surface": "#eef0ff",
      "on-primary-container": "#f6e6ff",
      "primary-container": "#691dbf",
      "surface-bright": "#faf8ff",
      "surface-variant": "#dae2fd",
      "secondary-fixed": "#62fae3",
      "inverse-surface": "#283044",
      "on-background": "#131b2e",
      "on-tertiary-container": "#ffe8d1",
      "surface-container-lowest": "#ffffff",
      "on-secondary-fixed-variant": "#005047",
      "on-secondary": "#ffffff",
      "on-error": "#ffffff",
      "on-tertiary": "#ffffff",
      "secondary": "#006b5f",
      "on-tertiary-fixed": "#2a1700"
},
      borderRadius: {
      "DEFAULT": "0.25rem",
      "lg": "0.5rem",
      "xl": "0.75rem",
      "full": "9999px"
},
      spacing: {
      "base": "4px",
      "stack-lg": "24px",
      "stack-md": "16px",
      "stack-sm": "8px",
      "margin-mobile": "20px",
      "gutter": "16px",
      "section-gap": "40px"
},
      fontFamily: {
      "body-md": [
            "Manrope"
      ],
      "headline-lg": [
            "Plus Jakarta Sans"
      ],
      "body-lg": [
            "Manrope"
      ],
      "label-sm": [
            "Manrope"
      ],
      "label-md": [
            "Manrope"
      ],
      "headline-lg-mobile": [
            "Plus Jakarta Sans"
      ],
      "headline-xl": [
            "Plus Jakarta Sans"
      ]
},
      fontSize: {
      "body-md": [
            "16px",
            {
                  "lineHeight": "1.6",
                  "fontWeight": "400"
            }
      ],
      "headline-lg": [
            "24px",
            {
                  "lineHeight": "1.3",
                  "fontWeight": "700"
            }
      ],
      "body-lg": [
            "18px",
            {
                  "lineHeight": "1.6",
                  "fontWeight": "400"
            }
      ],
      "label-sm": [
            "12px",
            {
                  "lineHeight": "1.4",
                  "fontWeight": "500"
            }
      ],
      "label-md": [
            "14px",
            {
                  "lineHeight": "1.4",
                  "letterSpacing": "0.05em",
                  "fontWeight": "600"
            }
      ],
      "headline-lg-mobile": [
            "22px",
            {
                  "lineHeight": "1.3",
                  "fontWeight": "700"
            }
      ],
      "headline-xl": [
            "32px",
            {
                  "lineHeight": "1.2",
                  "letterSpacing": "-0.02em",
                  "fontWeight": "800"
            }
      ]
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
