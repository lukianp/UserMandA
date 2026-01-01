#!/usr/bin/env node
/**
 * Fix import paths for universalDiscoveryMocks
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const testFiles = glob.sync('src/renderer/views/**/*.test.tsx', {
  cwd: __dirname,
});

console.log(`Fixing import paths in ${testFiles.length} test files\n`);

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('universalDiscoveryMocks')) {
    const original = content;

    // Replace incorrect relative paths with correct one
    // From src/renderer/views/X/Y.test.tsx to src/test-utils/
    // Need to go up 3 levels: ../../../test-utils/
    content = content.replace(
      /from\s+['"]\.\.\/\.\.\/test-utils\/universalDiscoveryMocks['"]/g,
      "from '../../../test-utils/universalDiscoveryMocks'"
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed import path in ${file}`);
      totalFixed++;
    }
  }
});

console.log(`\n✅ Fixed ${totalFixed} import paths`);
