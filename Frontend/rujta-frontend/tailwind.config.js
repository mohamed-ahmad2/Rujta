/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // صححت الشرطتين إلى النجمة المزدوجة
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
      },
      colors: {
        primary: "#000000",
        secondary: "#9DC873",
        page: "#F5F5F5",
        pr: "#3C623C",
        accent: "#22D3EE",
        border: "#E5E7EB",
        "muted-foreground": "#6B7280",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3C623C, #9DC873)",
        "gradient-background": "linear-gradient(135deg, #F5F5F5, #FFFFFF)",
      },
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.1)",
      },
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
    },
  },
  plugins: [],
};
