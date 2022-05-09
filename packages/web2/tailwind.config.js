const colors = require("tailwindcss/colors");
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,jsx,js}",
    "../../node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.red,
        gray: colors.neutral,
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("flowbite/plugin")],
};
