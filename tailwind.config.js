/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0b0e11",
          dark: "#181a20",
          gray: "#848e9c",
          yellow: "#fcd535",
          green: "#0ecb81",
          red: "#f6465d",
        }
      }
    },
  },
  plugins: [],
}