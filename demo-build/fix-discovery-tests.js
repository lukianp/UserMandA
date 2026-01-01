const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/renderer/views/discovery/*DiscoveryView.test.tsx');
let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix Pattern: Add isDiscovering when isRunning is true
  content = content.replace(
    /([\s\r]*)isRunning: true,([\r\n]+)([\s]*)progress:/g,
    '$1isRunning: true,$2$1isDiscovering: true,$2$3progress:'
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    totalFixed++;
    const pathParts = file.split(/[\\/]/);
    const name = pathParts[pathParts.length - 1];
    console.log('Fixed:', name);
  }
});

console.log('\nTotal discovery view tests fixed:', totalFixed);
