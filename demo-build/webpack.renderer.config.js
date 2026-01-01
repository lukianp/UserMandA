const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

const { rules: baseRules } = require('./webpack.rules');
const { plugins } = require('./webpack.plugins');

// Renderer-specific rules (exclude asset-relocator-loader for browser context)
const rendererRules = baseRules.filter(rule =>
  rule.use?.loader !== '@vercel/webpack-asset-relocator-loader'
);

const rendererConfig = {
  entry: './src/renderer.tsx',
  output: {
    path: path.resolve(__dirname, '.webpack/renderer/main_window'),
    filename: '[name].[contenthash].js',
    publicPath: './',
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'electron-renderer',
  module: {
    rules: rendererRules,  // Use filtered rules without asset-relocator
  },
  plugins: [
    ...plugins,
    // HTML plugin to inject bundles into index.html
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
      inject: 'body',
      scriptLoading: 'defer',
    }),
    // Provide global polyfills for renderer process
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
      global: path.resolve(__dirname, 'src/global-shim.js'),  // Provide global as window
    }),
    // Define additional globals for renderer context
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
    // CSP plugin disabled - causes conflicts with webpack chunk loading
    // The meta CSP in index.html provides sufficient security for Electron
    // new CspHtmlWebpackPlugin({
    //   'default-src': ["'self'"],
    //   'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    //   'style-src': ["'self'", "'unsafe-inline'"],
    //   'img-src': ["'self'", 'data:', 'blob:'],
    //   'connect-src': ["'self'"],
    //   'font-src': ["'self'", 'data:'],
    //   'object-src': ["'none'"],
    //   'base-uri': ["'self'"],
    //   'form-action': ["'self'"],
    // }),
    // Only enable bundle analyzer when explicitly requested
    ...(process.env.ANALYZE_BUNDLE === 'true' ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-analysis.html',
      })
    ] : []),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$|\.svg$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@components': path.resolve(__dirname, 'src/renderer/components'),
      '@views': path.resolve(__dirname, 'src/renderer/views'),
      '@hooks': path.resolve(__dirname, 'src/renderer/hooks'),
      '@store': path.resolve(__dirname, 'src/renderer/store'),
      '@services': path.resolve(__dirname, 'src/renderer/services'),
      '@types': path.resolve(__dirname, 'src/renderer/types'),
      '@lib': path.resolve(__dirname, 'src/renderer/lib'),
    },
    fallback: {
      'process/browser': false,  // Browser doesn't need process
      'process': false,
      'buffer': false,
      'crypto': false,  // CRITICAL: Prevent crypto from being bundled for browser
    },
  },
  infrastructureLogging: {
    level: 'error',
    colors: false,
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: { ecma: 8 },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
            passes: 2,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
            reduce_vars: true,
            sequences: true,
            side_effects: true,
            unused: true,
          },
          mangle: { safari10: true },
          format: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        extractComments: false,
        parallel: true,
      }),
      new CssMinimizerPlugin({
        parallel: true,
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
            },
          ],
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
        discovery: {
          test: /[\\/]src[\\/]renderer[\\/]views[\\/]discovery[\\/]/,
          name: 'discovery-views',
          chunks: 'all',
        },
        migration: {
          test: /[\\/]src[\\/]renderer[\\/]views[\\/]migration[\\/]/,
          name: 'migration-views',
          chunks: 'all',
        },
      },
    },
    concatenateModules: true,
    sideEffects: false,
    usedExports: true,
    innerGraph: true,
    providedExports: true,
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 5242880, // 5MB for renderer
    maxAssetSize: 2097152, // 2MB
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
  stats: {
    preset: 'normal',
    colors: false,
  },
};

// Export config object for webpack-plugin (Electron Forge)
module.exports.rendererConfig = rendererConfig;

// Export config directly for standalone webpack builds
module.exports = rendererConfig;
