/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        'primary-color': '#041938',
        'secondary-color': '#e3f2fd',
        'accent-color': '#808080',
        'text-color': '#333',
        'background-color': '#f5f5f5'
      }
    },
  },

  plugins: [],
};
