/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        getgrub: {
          navy: '#1A1A2E',
          coral: '#1A1A2E',
          cream: '#FAF7F2',
          teal: '#1d9e75',
          gold: '#F5B301',
        },
      },
    },
  },
  plugins: [],
};
