module.exports = {
  plugins: process.env.VITE_POSTCSS_DISABLE ? {} : { tailwindcss: {}, autoprefixer: {} },
};


module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
