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
  target: 'electron-main', // CRITICAL: Specify electron-main target
  // Put your normal webpack config below here
  output: {
    publicPath: '', // Prevent automatic publicPath
  },
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      os: require.resolve('os-browserify'),
      child_process: false,
      'fs/promises': false,
      vm: require.resolve('vm-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      buffer: require.resolve('buffer'),
      assert: require.resolve('assert'),
      constants: require.resolve('constants-browserify'),
      querystring: require.resolve('querystring-es3')
    }
  },
  externals: {
    electron: 'commonjs electron',
    // External packages that should not be bundled
    chokidar: 'commonjs chokidar',
    glob: 'commonjs glob',
    // Node built-in modules (with node: prefix)
    'node:fs': 'commonjs fs',
    'node:path': 'commonjs path',
    'node:url': 'commonjs url',
    'node:events': 'commonjs events',
    'node:stream': 'commonjs stream',
    'node:fs/promises': 'commonjs fs/promises',
    'node:string_decoder': 'commonjs string_decoder',
    'node:util': 'commonjs util',
    'node:buffer': 'commonjs buffer'
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

module.exports = mainConfig;
