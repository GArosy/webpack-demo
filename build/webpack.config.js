const Webpack = require("webpack")
const path = require("path"); // webpack依赖于node.js运行，因此使用CJS引入包
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

process.env.NODE_ENV = "development";

const config = {
  mode: "development", // 开发者模式
  entry: path.resolve(__dirname, "../src/main.js"), // 入口文件，使用resolve构造绝对路径（nodejs中 ./ 为工作目录）
  output: {
    filename: "[name].[hash:8].js", // 打包后的文件名，为了缓存使用hash值散列每次打包文件
    path: path.resolve(__dirname, "../dist"), // 打包后的目录
  },
  devServer: {
    port: 5000,
    hot: true
  },
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"), // 本地模板文件的位置
      filename: "index.html", // 输出文件的文件名称
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].[hash:8].css",
      chunkFilename: "[id].css",
      ignoreOrder: true
    })
  ],
  module: {
    rules: [
      // CSS
      {
        test: /\.css$/, // 正则匹配.css文件
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"], // 多个loader从右向左解析
      },
      {
        test: /\.less$/,
        use: [
          // "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "less-loader",
        ],
      },
      // JS
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
        },
        exclude: /node_modules/,
      },
    ],
  },
};

// module.exports = SMP.wrap(config);
module.exports = config;