const colors = require("tailwindcss/colors");
module.exports = {
  darkMode: "media",
  content: [
    "./app/**/*.{ts,tsx,jsx,js}",
    "../../node_modules/flowbite/**/*.js",
  ],
  important: "#root",
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.red,
        gray: colors.neutral,
      },
    },
  },
};
