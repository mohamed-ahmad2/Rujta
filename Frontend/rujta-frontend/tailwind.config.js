/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

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
        secondary: "#9DC873",
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
        moveStars: {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(-1000px, 1000px)" },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-20px) rotate(1.5deg)",
          },
        },
      },

      animation: {
        moveStars: "moveStars 100s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },

  plugins: [],
};
