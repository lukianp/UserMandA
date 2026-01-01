// Test if WebpackPlugin can be instantiated correctly

const { WebpackPlugin } = require('@electron-forge/plugin-webpack');
const { mainConfig } = require('./webpack.main.config');
const { rendererConfig } = require('./webpack.renderer.config');

console.log('Testing WebpackPlugin instantiation...\n');

console.log('1. Imported WebpackPlugin:', typeof WebpackPlugin);
console.log('2. mainConfig type:', typeof mainConfig);
console.log('3. rendererConfig type:', typeof rendererConfig);

try {
  const plugin = new WebpackPlugin({
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
    loggerPort: 9000,
  });

  console.log('\n4. Plugin created successfully!');
  console.log('5. Plugin type:', typeof plugin);
  console.log('6. Plugin constructor:', plugin.constructor.name);
  console.log('7. Has __isElectronForgePlugin?', '__isElectronForgePlugin' in plugin);
  console.log('8. __isElectronForgePlugin value:', plugin.__isElectronForgePlugin);
  console.log('9. Plugin keys:', Object.keys(plugin));
  console.log('\n✅ WebpackPlugin instantiation works correctly!');
} catch (err) {
  console.error('\n❌ Error creating WebpackPlugin:');
  console.error(err.message);
  console.error(err.stack);
}
