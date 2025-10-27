/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        playfair:["playfair Display","serif"],
      },

      colors:{
        primary:"#000000",
        secondary:"#9DC873",
         page: "#F6F6F6",
      },
      container:{
          center : true,
          padding:{
          DEFAULT: "1rem" ,
          sm:"2rem" ,
          lg:"4rem" ,
          xl:"5rem" ,
          "2xl": "6rem" ,

        },
      },
      
    },
  },
  plugins: [],
};
