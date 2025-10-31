const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { rendererConfig } = require('./webpack.renderer.config');

module.exports = {
  ...rendererConfig,
  entry: './src/renderer.tsx',
  target: 'electron-renderer',
  output: {
    path: path.join(__dirname, '.webpack/renderer/main_window'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: './',
  },
  plugins: [
    ...(rendererConfig.plugins || []),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
};
