/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary1: "#F5DB54",
        primary2: "#ADB0B9",
        primary3: "#996BFF",
        primary4: "#118C4F",
        alert: "#EE4B2B",
        secondary1: "#EAE4FC",
        secondary2: "#D3EFDE",
        secondary3: "#FFF4b6",
        secondary4: "#D4D3E8",
      },
    },
  },
  plugins: [],
};
