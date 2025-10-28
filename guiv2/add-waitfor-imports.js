#!/usr/bin/env node
/**
 * Add waitFor import to test files that use it but don't import it
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');

const pattern = 'src/renderer/hooks/use*DiscoveryLogic.test.ts';
const files = glob.sync(pattern, { cwd: __dirname });

let fixed = 0;
let skipped = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check if file uses waitFor but doesn't import it
  if (content.includes('waitFor(') && !content.includes('import { renderHook, act, waitFor }')) {
    // Add waitFor to import
    const newContent = content.replace(
      /import \{ renderHook, act \}/,
      'import { renderHook, act, waitFor }'
    );

    if (newContent !== content) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`FIXED: ${file}`);
      fixed++;
    } else {
      console.log(`SKIPPED: ${file} - couldn't find import pattern`);
      skipped++;
    }
  } else {
    skipped++;
  }
});

console.log(`\nFixed: ${fixed}, Skipped: ${skipped}`);
