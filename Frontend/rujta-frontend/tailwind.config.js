/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  darkMode: "class",

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },

    extend: {
      /* ===== FONTS ===== */
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
      },

      /* ===== COLORS ===== */
      colors: {
        primary: "#000000",
        secondary: {
          DEFAULT: "#9DC873",
          dark: "#7EA85A",
        },
        page: "#F5F5F5",
        pr: "#3C623C",
        accent: "#22D3EE",
        border: "#E5E7EB",
        "muted-foreground": "#6B7280",
      },

      /* ===== BACKGROUNDS ===== */
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #9DC873, #9DC873)",
        "gradient-background": "linear-gradient(135deg, #F5F5F5, #FFFFFF)",
      },

      /* ===== GLASS EFFECT ===== */
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.1)",
      },

      /* ===== ANIMATIONS ===== */
      keyframes: {
        fadeUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(16px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },

  plugins: [],
};
