import type { Configuration } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

// Check if we're in analyze mode
const isAnalyzing = process.env.ANALYZE_BUNDLE === 'true';
const isProduction = process.env.NODE_ENV === 'production';

export const rendererConfig: Configuration = {
  mode: isProduction ? 'production' : 'development',
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    // Bundle analyzer for size analysis
    ...(isAnalyzing
      ? [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-report.html',
            openAnalyzer: false, // Don't auto-open to prevent issues
            generateStatsFile: true,
            statsFilename: 'bundle-stats.json',
            // Prevent circular dependency issues
            excludeAssets: /\.map$/,
            logLevel: 'warn',
          }),
        ]
      : []),
    // Add compression for production builds (disabled for now due to stack overflow)
    // Re-enable after testing basic build works
    // ...(isProduction
    //   ? [
    //       new CompressionPlugin({
    //         algorithm: 'gzip',
    //         test: /\.(js|css|html|svg|json)$/,
    //         threshold: 10240,
    //         minRatio: 0.8,
    //         deleteOriginalAssets: false,
    //       }),
    //     ]
    //   : []),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    // Add aliases for cleaner imports and better tree shaking
    alias: {
      '@': require('path').resolve(__dirname, 'src/renderer'),
      '@components': require('path').resolve(__dirname, 'src/renderer/components'),
      '@views': require('path').resolve(__dirname, 'src/renderer/views'),
      '@hooks': require('path').resolve(__dirname, 'src/renderer/hooks'),
      '@store': require('path').resolve(__dirname, 'src/renderer/store'),
      '@services': require('path').resolve(__dirname, 'src/renderer/services'),
      '@types': require('path').resolve(__dirname, 'src/renderer/types'),
      '@lib': require('path').resolve(__dirname, 'src/renderer/lib'),
    },
  },
  optimization: isProduction
    ? {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              parse: {
                ecma: 8,
              },
              compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
                drop_console: true,
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
              mangle: {
                safari10: true,
              },
              format: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
            extractComments: false,
            parallel: true,
          }),
          // CSS optimization
          new CssMinimizerPlugin({
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
        // Advanced chunk splitting for optimal loading
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 244000, // Split large chunks
          cacheGroups: {
            // Core React libraries (highest priority, always needed)
            reactCore: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react-core',
              priority: 30,
              reuseExistingChunk: true,
              enforce: true,
            },
            // React Router (loaded immediately after React)
            reactRouter: {
              test: /[\\/]node_modules[\\/]react-router.*[\\/]/,
              name: 'react-router',
              priority: 25,
              reuseExistingChunk: true,
            },
            // AG Grid - Large library, lazy loaded
            agGridCore: {
              test: /[\\/]node_modules[\\/]ag-grid-community[\\/]/,
              name: 'ag-grid-core',
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
            agGridEnterprise: {
              test: /[\\/]node_modules[\\/]ag-grid-enterprise[\\/]/,
              name: 'ag-grid-enterprise',
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
            agGridReact: {
              test: /[\\/]node_modules[\\/]ag-grid-react[\\/]/,
              name: 'ag-grid-react',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Recharts and D3 - Large visualization library
            recharts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: 'recharts',
              priority: 15,
              reuseExistingChunk: true,
              enforce: true,
            },
            d3: {
              test: /[\\/]node_modules[\\/](d3-.*|d3)[\\/]/,
              name: 'd3-libs',
              priority: 15,
              reuseExistingChunk: true,
            },
            // State management and utilities
            zustand: {
              test: /[\\/]node_modules[\\/](zustand|immer)[\\/]/,
              name: 'state-management',
              priority: 18,
              reuseExistingChunk: true,
            },
            // UI Components and styling
            uiLibs: {
              test: /[\\/]node_modules[\\/](lucide-react|@headlessui|clsx|tailwind-merge)[\\/]/,
              name: 'ui-libs',
              priority: 17,
              reuseExistingChunk: true,
            },
            // Date utilities
            dateLibs: {
              test: /[\\/]node_modules[\\/](date-fns)[\\/]/,
              name: 'date-libs',
              priority: 12,
              reuseExistingChunk: true,
            },
            // Data processing
            dataLibs: {
              test: /[\\/]node_modules[\\/](papaparse)[\\/]/,
              name: 'data-libs',
              priority: 11,
              reuseExistingChunk: true,
            },
            // Virtualization for performance
            virtualization: {
              test: /[\\/]node_modules[\\/](react-window)[\\/]/,
              name: 'virtualization',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Common vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Get the package name
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                // Group small packages together
                if (module.size() < 50000) {
                  return 'vendor-common';
                }
                // Keep larger packages separate for better caching
                return `vendor-${packageName.replace('@', '').replace('/', '-')}`;
              },
              priority: 5,
              reuseExistingChunk: true,
            },
            // Application styles
            styles: {
              name: 'styles',
              type: 'css/mini-extract',
              chunks: 'all',
              enforce: true,
            },
            // Default chunk for application code
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
        // Enable module concatenation (scope hoisting) for better tree shaking
        concatenateModules: true,
        // Enable side effects optimization
        sideEffects: false,
        // Used exports tree shaking
        usedExports: true,
        // Inner graph optimization
        innerGraph: true,
        // Provide used exports info for better tree shaking
        providedExports: true,
        // Runtime chunk for better caching
        runtimeChunk: 'single',
        // Module IDs for better caching
        moduleIds: 'deterministic',
        // Chunk IDs
        chunkIds: 'deterministic',
      }
    : {
        minimize: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      },
  performance: {
    hints: isProduction ? 'warning' : false,
    maxEntrypointSize: 5242880, // 5MB - target initial bundle
    maxAssetSize: 2097152, // 2MB - individual asset size
  },
  // Better source maps for production
  devtool: isProduction ? 'source-map' : 'inline-source-map',
  // Externals to reduce bundle size (Electron provides these)
  externals: {
    'electron': 'commonjs electron',
    'fs': 'commonjs fs',
    'path': 'commonjs path',
    'os': 'commonjs os',
    'crypto': 'commonjs crypto',
    'buffer': 'commonjs buffer',
    'stream': 'commonjs stream',
    'util': 'commonjs util',
    'events': 'commonjs events',
    'child_process': 'commonjs child_process',
  },
  // Stats configuration for better analysis
  stats: isAnalyzing
    ? {
        preset: 'normal',
        colors: true,
        hash: true,
        timings: true,
        chunks: true,
        chunkModules: false, // Reduce output size
        modules: false, // Reduce output size
        children: false,
        depth: false,
        maxModules: 100, // Limit module output
      }
    : 'normal',
};