const { merge } = require('webpack-merge'),
  webpack = require('webpack'),
  common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    // contentBase: '/dist',
    host: "10.21.24.250",
    port: 3030,
    hot: false,
    historyApiFallback: true,
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({

    }),
  ],
});