// Webpack config for preload script
const path = require('path');
const { rules } = require('./webpack.rules');

module.exports = {
  entry: './src/preload.ts',
  target: 'electron-preload',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  output: {
    path: path.resolve(__dirname, '.webpack/preload'),
    filename: 'index.js',
  },
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.json'],
  },
  externals: {
    electron: 'commonjs electron',
  },
};
