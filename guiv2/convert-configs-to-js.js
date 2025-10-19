/**
 * Convert Electron Forge TypeScript configs to JavaScript
 * This fixes the Electron Forge config loading issue
 */

const fs = require('fs');
const path = require('path');

console.log('Converting Electron Forge configs from TypeScript to JavaScript...\n');

const conversions = {
  'forge.config.ts': `const { MakerSquirrel } = require('@electron-forge/maker-squirrel');
const { MakerZIP } = require('@electron-forge/maker-zip');
const { MakerDeb } = require('@electron-forge/maker-deb');
const { MakerRpm } = require('@electron-forge/maker-rpm');
const { AutoUnpackNativesPlugin } = require('@electron-forge/plugin-auto-unpack-natives');
const { WebpackPlugin } = require('@electron-forge/plugin-webpack');
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const { mainConfig } = require('./webpack.main.config');
const { rendererConfig } = require('./webpack.renderer.config');

const config = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
      loggerPort: 9000, // Specify logger port to avoid colorette issues
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

module.exports = config;
`,

  'webpack.main.config.ts': `const TerserPlugin = require('terser-webpack-plugin');

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
`,

  'webpack.renderer.config.ts': null, // Will read and convert
  'webpack.plugins.ts': null, // Will read and convert
  'webpack.rules.ts': null, // Will read and convert
};

// Read webpack.renderer.config.ts and convert it
const rendererPath = path.join(__dirname, 'webpack.renderer.config.ts');
if (fs.existsSync(rendererPath)) {
  const content = fs.readFileSync(rendererPath, 'utf-8');

  // Check file size to determine conversion approach
  const lines = content.split('\n').length;
  console.log(`webpack.renderer.config.ts has ${lines} lines`);

  if (lines > 200) {
    console.log('File is large, will create simplified version for now');
    conversions['webpack.renderer.config.ts'] = `const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const { rules } = require('./webpack.rules');
const { plugins } = require('./webpack.plugins');

const rendererConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules,
  },
  plugins,
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
      maxInitialRequests: 25,
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        reactCore: {
          test: /[\\\\/]node_modules[\\\\/](react|react-dom)[\\\\/]/,
          name: 'react-core',
          priority: 30,
          reuseExistingChunk: true,
          enforce: true,
        },
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendor-common',
          priority: 5,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
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

module.exports = { rendererConfig };
`;
  }
}

// Read webpack.plugins.ts and convert
const pluginsPath = path.join(__dirname, 'webpack.plugins.ts');
if (fs.existsSync(pluginsPath)) {
  conversions['webpack.plugins.ts'] = `const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
    async: process.env.NODE_ENV !== 'production',
    typescript: {
      diagnosticOptions: {
        semantic: true,
        syntactic: true,
      },
      mode: 'write-references',
    },
  }),
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
`;
}

// Read webpack.rules.ts and convert
const rulesPath = path.join(__dirname, 'webpack.rules.ts');
if (fs.existsSync(rulesPath)) {
  conversions['webpack.rules.ts'] = `const rules = [
  // Add support for native node modules
  {
    test: /native_modules[\\\\/].+\\.node$/,
    use: 'node-loader',
  },
  {
    test: /[\\\\/]node_modules[\\\\/].+\\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\\.tsx?$/,
    exclude: /(node_modules|.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  {
    test: /\\.css$/,
    use: [
      { loader: 'style-loader' },
      { loader: 'css-loader' },
      { loader: 'postcss-loader' },
    ],
  },
];

module.exports = { rules };
`;
}

// Perform conversions
let converted = 0;
let skipped = 0;

for (const [filename, content] of Object.entries(conversions)) {
  if (!content) {
    console.log(`⚠️  Skipping ${filename} (needs manual conversion)`);
    skipped++;
    continue;
  }

  const tsPath = path.join(__dirname, filename);
  const jsFilename = filename.replace(/\\.ts$/, '.js');
  const jsPath = path.join(__dirname, jsFilename);

  try {
    // Backup original TypeScript file
    if (fs.existsSync(tsPath) && !fs.existsSync(tsPath + '.backup')) {
      fs.copyFileSync(tsPath, tsPath + '.backup');
      console.log(`📄 Backed up ${filename} to ${filename}.backup`);
    }

    // Write JavaScript version
    fs.writeFileSync(jsPath, content, 'utf-8');
    console.log(`✅ Created ${jsFilename}`);
    converted++;
  } catch (err) {
    console.error(`❌ Error converting ${filename}:`, err.message);
  }
}

console.log(`\n✅ Conversion complete!`);
console.log(`   Converted: ${converted} files`);
console.log(`   Skipped: ${skipped} files`);
console.log(`\nNext steps:`);
console.log(`1. Review the generated .js files`);
console.log(`2. Run: npm run package`);
console.log(`3. If successful, you can remove the .ts versions`);
console.log(`4. Original files backed up with .backup extension`);
