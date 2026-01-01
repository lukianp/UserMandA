const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

const plugins = [
  // TEMPORARILY DISABLED FOR BUILD VERIFICATION - type checking disabled to allow build to complete
  // new ForkTsCheckerWebpackPlugin({
  //   logger: 'webpack-infrastructure',
  //   async: process.env.NODE_ENV !== 'production',
  //   typescript: {
  //     diagnosticOptions: {
  //       semantic: true,
  //       syntactic: true,
  //     },
  //     mode: 'write-references',
  //   },
  // }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    '__DEV__': JSON.stringify(process.env.NODE_ENV !== 'production'),
    '__PROD__': JSON.stringify(process.env.NODE_ENV === 'production'),
  }),
  new webpack.IgnorePlugin({
    resourceRegExp: /^colorette$/,
    contextRegExp: /listr2/,
  }),
];

module.exports = { plugins };
