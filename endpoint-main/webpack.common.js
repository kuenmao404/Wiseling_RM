const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {
  title
} = require('./config.json');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  output: {
    path: path.join(__dirname, "/dist"), // the bundle output path
    filename: '[name].js', // the name of the bundle
    publicPath: '/',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: title,
      template: "src/index.html", // to import index.html file inside index.js
      inject: true,
    }),
    new CopyPlugin({
      patterns: [{ from: 'src/public', to: path.resolve(__dirname, "dist/"), noErrorOnMissing: true }]
    }),
  ],
  entry: {
    vendors: ['react', 'react-dom'],
    app: [__dirname + '/src/index.jsx'],

  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      Config: __dirname + '/config.dev.json',
      apis: __dirname + '/src/apis',
      components: __dirname + '/src/components',
    }
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // .js and .jsx files
        exclude: /node_modules/, // excluding the node_modules folder
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.styl?/,
        use: ['style-loader', 'css-loader', 'stylus-loader']
      },
      {
        test: /\.(sa|sc|c)ss$/, // styles files
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/, // to import images and fonts
        loader: "url-loader",
        options: { limit: false },
      }, {
        test: /\.md$/,
        use: 'raw-loader'
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
    }
  },
};