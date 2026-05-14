/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        getgrub: {
          navy: '#1a1a2e',
          coral: '#e8593c',
          cream: '#fafaf8',
          teal: '#1d9e75',
        },
      },
    },
  },
  plugins: [],
};
