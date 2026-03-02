/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          neon: '#00ff88',
          dim:  '#00cc6a',
          dark: '#003322',
          glow: 'rgba(0,255,136,0.15)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease forwards',
        'pulse-green': 'pulse-green 2s infinite',
      },
    },
  },
  plugins: [],
};