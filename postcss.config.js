module.exports = ({ env }) => ({
  plugins: env === 'production' ? { tailwindcss: {}, autoprefixer: {} } : {},
});


module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
