const TerserPlugin = require('terser-webpack-plugin');

const { rules } = require('./webpack.rules');
const { plugins } = require('./webpack.plugins');

const mainConfig = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  infrastructureLogging: {
    level: 'error', // Reduce logging to avoid colorette issues
    colors: false,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: true,
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
        extractComments: false,
        parallel: true,
      }),
    ],
    usedExports: true, // Tree shaking
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 2097152, // 2MB for main process
    maxAssetSize: 1048576, // 1MB
  },
};

module.exports = { mainConfig };
