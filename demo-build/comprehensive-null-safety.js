const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all view component files (not tests)
const viewDirs = [
  'src/renderer/views/advanced',
  'src/renderer/views/admin',
  'src/renderer/views/analytics',
  'src/renderer/views/assets',
  'src/renderer/views/compliance',
  'src/renderer/views/groups',
  'src/renderer/views/infrastructure',
  'src/renderer/views/licensing',
  'src/renderer/views/migration',
  'src/renderer/views/overview',
  'src/renderer/views/reports',
  'src/renderer/views/security',
  'src/renderer/views/settings',
  'src/renderer/views/users',
];

let totalFixed = 0;
const fixedFiles = [];

viewDirs.forEach(dir => {
  const fullDir = path.join(__dirname, dir);
  if (!fs.existsSync(fullDir)) return;

  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.tsx') && !f.endsWith('.test.tsx'));

  files.forEach(file => {
    const filePath = path.join(fullDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip if already has heavy null coalescing
    const alreadyProtected = (content.match(/\?\? \[\]/g) || []).length;
    if (alreadyProtected > 20) {
      return; // Already well-protected
    }

    // Patterns to fix - be careful not to break already fixed code

    // 1. Simple data.length (not already wrapped)
    if (/(?<!\)\s*)(?<!\?\? \[\]\.)\bdata\.length\b/.test(content)) {
      content = content.replace(/(?<!\?\? \[\]\.)(?<!const \w+ = )\bdata\.length\b/g, (match, offset) => {
        // Check if already wrapped
        const before = content.substring(Math.max(0, offset - 15), offset);
        if (before.includes('?? []') || before.includes('(data')) {
          return match;
        }
        return '(data ?? []).length';
      });
      modified = true;
    }

    // 2. data.filter/map/reduce/find/some/every
    const arrayMethods = ['filter', 'map', 'reduce', 'find', 'some', 'every', 'forEach', 'slice', 'sort'];
    arrayMethods.forEach(method => {
      const pattern = new RegExp(`(?<!\\?\\? \\[\\]\\.)\\bdata\\.${method}\\(`, 'g');
      if (pattern.test(content)) {
        content = content.replace(pattern, `(data ?? []).${method}(`);
        modified = true;
      }
    });

    // 3. items, results, list, logs, etc.
    const commonArrayVars = ['items', 'results', 'list', 'logs', 'apis', 'users', 'groups', 'rules',
                             'policies', 'configurations', 'settings', 'services', 'alerts', 'events',
                             'records', 'entries', 'nodes', 'devices', 'servers'];

    commonArrayVars.forEach(varName => {
      // length
      const lengthPattern = new RegExp(`(?<!\\?\\? \\[\\]\\.)\\b${varName}\\.length\\b`, 'g');
      if (lengthPattern.test(content)) {
        content = content.replace(lengthPattern, `(${varName} ?? []).length`);
        modified = true;
      }

      // array methods
      arrayMethods.forEach(method => {
        const pattern = new RegExp(`(?<!\\?\\? \\[\\]\\.)\\b${varName}\\.${method}\\(`, 'g');
        if (pattern.test(content)) {
          content = content.replace(pattern, `(${varName} ?? []).${method}(`);
          modified = true;
        }
      });
    });

    // 4. Object property access with potential null
    // result?.data?.items?.length -> (result?.data?.items ?? []).length
    const nestedArrayPattern = /(\w+\??\.\w+\??\.\w+)\.length\b(?!\s*\?\?)/g;
    if (nestedArrayPattern.test(content)) {
      content = content.replace(nestedArrayPattern, (match, path) => {
        if (path.includes('??')) return match; // Already protected
        return `(${path} ?? []).length`;
      });
      modified = true;
    }

    // 5. Statistics calculations with division by data.length
    // data.reduce(...) / data.length -> data.reduce(...) / (data ?? []).length
    // But be careful if data is already wrapped
    const divisionPattern = /\/\s*data\.length\b/g;
    if (divisionPattern.test(content)) {
      content = content.replace(divisionPattern, '/ (data ?? []).length');
      modified = true;
    }

    // 6. Clean up double wrapping
    content = content.replace(/\(\((\w+) \?\? \[\]\) \?\? \[\]\)/g, '($1 ?? [])');
    content = content.replace(/\(\((\w+\.\w+) \?\? \[\]\) \?\? \[\]\)/g, '($1 ?? [])');

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalFixed++;
      fixedFiles.push(path.relative(__dirname, filePath));
      console.log(`✅ ${path.relative(__dirname, filePath)}`);
    }
  });
});

console.log(`\n✅ Fixed ${totalFixed} view files with null safety improvements`);
if (totalFixed > 0) {
  console.log('\nFixed files:');
  fixedFiles.forEach(f => console.log(`  - ${f}`));
}
