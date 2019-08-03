const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: {
    app: "./index.tsx"
  },
  devServer: {
    contentBase: path.join(__dirname, "lib"),
    compress: true,
    port: 8080,
    host: "0.0.0.0"
  },
  devtool: "eval-source-map",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "lib")
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.m?jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      },
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "life playground"
    })
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};
