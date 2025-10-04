import type { Configuration } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

// CSS rule is already defined in webpack.rules.ts - no need to add it again

export const rendererConfig: Configuration = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    // Add compression for production builds
    ...(process.env.NODE_ENV === 'production'
      ? [
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240, // Only compress files > 10KB
            minRatio: 0.8,
          }),
        ]
      : []),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  optimization: process.env.NODE_ENV === 'production'
    ? {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info'],
              },
              mangle: true,
              format: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            // Separate AG Grid bundle (large library)
            agGrid: {
              test: /[\\/]node_modules[\\/]ag-grid-.*[\\/]/,
              name: 'ag-grid',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Separate Recharts bundle (large library)
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
              name: 'recharts',
              priority: 10,
              reuseExistingChunk: true,
            },
            // React libraries
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
              name: 'react-vendor',
              priority: 8,
              reuseExistingChunk: true,
            },
            // Other vendor code
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
        usedExports: true,
      }
    : {
        minimize: false,
      },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 5242880, // 5MB
    maxAssetSize: 2097152, // 2MB
  },
};
