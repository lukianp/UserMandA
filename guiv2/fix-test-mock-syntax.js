#!/usr/bin/env node
/**
 * Fix syntax errors from incomplete mock replacements
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const testFiles = glob.sync('src/renderer/views/**/*.test.tsx', {
  cwd: __dirname,
});

console.log(`Checking ${testFiles.length} test files for syntax errors\n`);

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix pattern: const mockHookDefaults = createUniversalDiscoveryHook();, followed by remnant properties
  const badPattern = /const\s+mockHookDefaults\s*=\s*createUniversalDiscoveryHook\(\);,[\s\S]*?\n\s*\};/;
  if (badPattern.test(content)) {
    content = content.replace(
      badPattern,
      'const mockHookDefaults = createUniversalDiscoveryHook();'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed syntax error in ${file}`);
    totalFixed++;
  }
});

console.log(`\n✅ Fixed ${totalFixed} files with syntax errors`);
