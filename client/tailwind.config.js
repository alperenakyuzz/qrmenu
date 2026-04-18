/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4A017',
          50: '#fdf8ec',
          100: '#faeecb',
          200: '#f5dc92',
          300: '#efc450',
          400: '#e9ac28',
          500: '#D4A017',
          600: '#b87c10',
          700: '#935b10',
          800: '#794814',
          900: '#673c15',
          950: '#3b1f08',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
