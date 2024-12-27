const path = require("path");
const webpack = require("webpack");
require("dotenv").config({ path: ".env.local" });

module.exports = {
  mode: "production",
  entry: {
    popup: "./src/popup.ts",
    background: {
      import: "./src/background/background.ts",
      filename: "background.js",
    },
    ExtPay: {
      import: "extpay",
      filename: "../ExtPay.js",
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: (pathData) => {
      return "[name].js";
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.ANTHROPIC_API_KEY": JSON.stringify(
        process.env.ANTHROPIC_API_KEY
      ),
    }),
  ],
};
