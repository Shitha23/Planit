module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lightBlue: "#e0e6f0",
        blueGray: "#a7b5d3",
        mediumBlue: "#6f92c3",
        deepBlue: "#3f719d",
        navyBlue: "#1b4a79",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};
