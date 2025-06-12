/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'yoga-indigo': '#4f46e5',
        'yoga-green': '#10b981',
        'yoga-gray': '#f3f4f6',
      },
    },
  },
  plugins: [],
};