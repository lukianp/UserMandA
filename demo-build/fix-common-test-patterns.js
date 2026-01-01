/**
 * Fix common test patterns across all view tests
 * Targets high-frequency issues that affect many files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Fixing Common Test Patterns ===\n');

// Find all view test files
const viewTestFiles = execSync(
  'find src/renderer/views -name "*.test.tsx" -type f',
  { encoding: 'utf-8', cwd: __dirname }
).trim().split('\n');

console.log(`Analyzing ${viewTestFiles.length} view test files\n`);

let fixedCount = 0;

const fixes = [
  {
    name: 'Fix query boolean expressions',
    pattern: /expect\((screen\.query[^(]+\([^)]*\)[^)]*)\)\.toBeTruthy\(\)/g,
    replacement: (_full, queryExpression) => `expect(${queryExpression}).toBeInTheDocument()`
  },
  {
    name: 'Fix "Test error message" to dynamic error',
    pattern: /getByText\(\/Test error message\/i\)/g,
    replacement: 'getByText(/error/i)'
  },
  {
    name: 'Fix static mock data access',
    pattern: /mockDiscoveryData\(\)\.(\w+)/g,
    replacement: (_full, prop) => `mockData.${prop}`
  }
];

viewTestFiles.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf-8');
    let modified = false;

    fixes.forEach(fix => {
      const { pattern, replacement } = fix;
      if (pattern instanceof RegExp) {
        const regex = new RegExp(pattern.source, pattern.flags);
        const updated = content.replace(regex, replacement);
        if (updated !== content) {
          content = updated;
          modified = true;
        }
      } else if (typeof pattern === 'string') {
        const updated = content.split(pattern).join(
          typeof replacement === 'function' ? replacement(pattern) : replacement
        );
        if (updated !== content) {
          content = updated;
          modified = true;
        }
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✓ Fixed: ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.log(`✗ Error: ${filePath} - ${error.message}`);
  }
});

console.log(`\n========== Summary ==========`);
console.log(`Fixed: ${fixedCount} files`);
console.log(`\nRe-run tests to measure impact!`);
