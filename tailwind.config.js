/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html','./src/**/*.{html,js,jsx,tsx}'],
  theme: {
    fontFamily:{
      avante:["Avante-Garde", "sans-serif"]
    },
    letterSpacing: {
      tightest: '-.1em',
      tighter: '-.05em',
      tight: '-.025em',
      normal: '0',
      wide: '.025em',
      wider: '.05em',
      widest: '.1em',
      widest: '.25em',
    },
    container: {
      center: true,
    },
    extend: {},
  },
  plugins: [],
}

