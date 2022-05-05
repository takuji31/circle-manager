const colors = require("tailwindcss/colors");
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.red,
        gray: colors.neutral,
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
