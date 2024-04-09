/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.dev.html",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./routes/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
