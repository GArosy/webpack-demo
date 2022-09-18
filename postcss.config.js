module.exports = {
  // webpack5中，使用postcss-preset-env即可，它内置了autoprefixer
  plugins: [
    // require("autoprefixer"),
    require("postcss-preset-env"),
  ],
};
