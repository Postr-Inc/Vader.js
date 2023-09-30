/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js,vjs}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["light", "dark", "black"],
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
}

