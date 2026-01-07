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
        xs: ['0.9075rem', '1.21rem'],
        sm: ['1.05875rem', '1.5125rem'],
        base: ['1.21rem', '1.815rem'],
        lg: ['1.36125rem', '2.02125rem'],
        xl: ['1.5125rem', '2.26875rem'],
        '2xl': ['1.815rem', '2.7225rem'],
        '3xl': ['1.9965rem', '2.99475rem'],
        '4xl': ['2.2275rem', '3.34125rem'],
        '5xl': ['2.7225rem', '4.08375rem'],
        '6xl': ['3.63rem', '5.445rem'],
        '7xl': ['4.5375rem', '6.80625rem'],
        '8xl': ['6.3525rem', '9.52875rem'],
        '9xl': ['9.075rem', '13.6125rem'],
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
