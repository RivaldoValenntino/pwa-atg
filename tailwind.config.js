/** @type {import('tailwindcss').Config} */

import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", ...fontFamily.sans],
      },
      colors: {
        primary: "#B90101",
        muted: "#E0E0E0",
        textGray: "#828282",
      }
    },
  },
  plugins: [],
}
