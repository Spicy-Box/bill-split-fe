/** @type {import('tailwindcss').Config} */

const token = require("./utils/token.js");

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ["inter"],
      },
      fontSize: {
        xs: ['0.825rem', '1.1rem'],
        sm: ['0.9625rem', '1.375rem'],
        base: ['1.1rem', '1.65rem'],
        lg: ['1.2375rem', '1.8375rem'],
        xl: ['1.375rem', '2.0625rem'],
        '2xl': ['1.65rem', '2.475rem'],
        '3xl': ['1.815rem', '2.7225rem'],
        '4xl': ['2.025rem', '3.0375rem'],
        '5xl': ['2.475rem', '3.7125rem'],
        '6xl': ['3.3rem', '4.95rem'],
        '7xl': ['4.125rem', '6.1875rem'],
        '8xl': ['5.775rem', '8.6625rem'],
        '9xl': ['8.25rem', '12.375rem'],
      },
      colors: {
        primary1: token.colors.primary1,
        primary2: token.colors.primary2,
        primary3: token.colors.primary3,
        primary4: token.colors.primary4,
        alert: token.colors.alert,
        secondary1: token.colors.secondary1,
        secondary2: token.colors.secondary2,
        secondary3: token.colors.secondary3,
        secondary4: token.colors.secondary4,
        dark1: token.colors.dark1,
        dark2: token.colors.dark2,
        dark3: token.colors.dark3,
        light1: token.colors.light1,
        light2: token.colors.light2,
        light3: token.colors.light3,
        light4: token.colors.light4,
      },
    },
  },
  plugins: [],
};
