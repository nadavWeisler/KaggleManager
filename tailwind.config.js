/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kaggle: {
          blue: '#20BEFF',
          dark: '#1A1A2E',
        },
      },
    },
  },
  plugins: [],
}
