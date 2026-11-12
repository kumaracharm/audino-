/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F8F3",
        surface: "#FFFFFF",
        forest: "#203C35",
        muted: "#71817A",
        emerald: {
          DEFAULT: "#16866A",
          dark: "#126B55",
          light: "#E7F3F0",
        },
        teal: {
          DEFAULT: "#3AA99B",
          dark: "#2D857A",
          light: "#EDF8F7",
        },
        coral: {
          DEFAULT: "#E45D58",
          dark: "#C94843",
          light: "#FDF2F1",
        },
        amber: {
          DEFAULT: "#E6A23C",
          dark: "#C88523",
          light: "#FDF7EE",
        },
        sage: "#83AD8B",
        lavender: "#A99ACB",
        border: "#E4EAE4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

