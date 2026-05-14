module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        getgrub: {
          navy:  '#1a1a2e',
          coral: '#e8593c',
          cream: '#fafaf8',
          teal:  '#1d9e75',
        }
      }
    }
  }
};
