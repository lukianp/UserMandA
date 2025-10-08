#!/usr/bin/env node
/**
 * Batch fix Select component issues across all view files
 * Converts <Select> with children to native <select> elements
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const viewsDir = path.join(__dirname, 'src/renderer/views');
const selectClass = 'className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"';

// Find all .tsx files
const files = glob.sync(`${viewsDir}/**/*.tsx`);

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Pattern 1: <Select> with value prop and simple onChange
  // <Select value={X} onChange={(value) => setX(value)}> → <select value={X} onChange={(e) => setX(e.target.value)} className="...">
  const selectPattern = /<Select\s+value=\{([^}]+)\}\s+onChange=\{\(value\)\s*=>\s*([^}]+)\(value\)\}/g;
  if (selectPattern.test(content)) {
    content = content.replace(selectPattern, (match, value, setter) => {
      modified = true;
      return `<select value={${value}} onChange={(e) => ${setter}(e.target.value)} ${selectClass}`;
    });
  }

  // Pattern 2: Close Select tags
  const closePattern = /<\/Select>/g;
  if (closePattern.test(content)) {
    content = content.replace(closePattern, '</select>');
    modified = true;
  }

  // Pattern 3: Fix variant="secondary" to variant="default" for Badge
  const badgePattern = /<Badge\s+variant="secondary"/g;
  if (badgePattern.test(content)) {
    content = content.replace(badgePattern, '<Badge variant="default"');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log(`✓ Fixed ${file}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
