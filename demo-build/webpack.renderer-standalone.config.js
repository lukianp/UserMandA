// Standalone webpack config for building renderer process
const { rendererConfig } = require('./webpack.renderer.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

// Extract and modify the renderer config for standalone build
const config = {
  ...rendererConfig,
  entry: './src/renderer.tsx',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, '.webpack/renderer/main_window'),
    filename: '[name].js',
    chunkFilename: '[name].[contenthash].js',
  },
  plugins: [
    ...(rendererConfig.plugins || []),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
};

module.exports = config;
