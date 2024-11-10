/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        // You can add custom colors here
        // 'custom-color': '#123456',
      },
      fontFamily: {
        // You can add custom fonts here
        // 'custom-font': ['Font Name', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
