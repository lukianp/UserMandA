#!/usr/bin/env node
/**
 * Automated Fix Script for View Test Common Patterns
 *
 * Applies successful patterns from SecurityDashboardView fixes:
 * 1. Fix handler function mocks (missing parentheses)
 * 2. Fix multiple role="status" selectors
 * 3. Fix data array expectations for VirtualizedDataGrid
 */

const fs = require('fs');
const path = require('path');

const viewTestsDir = path.join(__dirname, 'src', 'renderer', 'views');

let filesFixed = 0;
let filesSkipped = 0;
let patternsFixed = {
  handlersFixed: 0,
  statusSelectorsFixed: 0,
  dataArraysFixed: 0
};

/**
 * Fix Pattern 1: Handler function mocks missing parentheses
 * handleExport: jest.fn, → handleExport: jest.fn(),
 */
function fixHandlerMocks(content) {
  const pattern = /(handle\w+):\s*jest\.fn,/g;
  let matches = 0;
  const fixed = content.replace(pattern, (match, handlerName) => {
    matches++;
    return `${handlerName}: jest.fn(),`;
  });
  patternsFixed.handlersFixed += matches;
  return fixed;
}

/**
 * Fix Pattern 2: Multiple role="status" elements
 * screen.getByRole('status') → screen.queryAllByRole('status')
 */
function fixStatusSelectors(content) {
  let fixed = content;
  let matches = 0;

  // Pattern: expect(screen.getByRole('status')...
  const pattern1 = /expect\(screen\.getByRole\('status'\)\)/g;
  if (pattern1.test(content)) {
    fixed = fixed.replace(pattern1, () => {
      matches++;
      return `expect(screen.queryAllByRole('status').length > 0)`;
    });
  }

  // Pattern: screen.getByRole('status') || screen.getByText...
  const pattern2 = /screen\.getByRole\('status'\)\s*\|\|\s*screen\.getByText\(([^)]+)\)/g;
  if (pattern2.test(fixed)) {
    fixed = fixed.replace(pattern2, (match, textPattern) => {
      matches++;
      return `screen.queryAllByRole('status').length > 0 || screen.queryByText(${textPattern})`;
    });
  }

  patternsFixed.statusSelectorsFixed += matches;
  return fixed;
}

/**
 * Fix Pattern 3: Data as object should be array for VirtualizedDataGrid
 * This requires manual review, just log potential issues
 */
function checkDataArrays(filePath, content) {
  // Look for data definitions that might be objects instead of arrays
  const objectDataPattern = /(\w+Data):\s*{[^}]+}/g;
  const matches = content.match(objectDataPattern);
  if (matches && matches.length > 0) {
    console.log(`⚠️  ${path.basename(filePath)} may have object data that should be arrays:`);
    matches.forEach(m => console.log(`    ${m.substring(0, 50)}...`));
  }
}

// Recursively find all test files in views directory
function findViewTests(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findViewTests(fullPath));
    } else if (item.endsWith('View.test.tsx') || item.endsWith('View.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

console.log('\n🔧 Fixing View Test Patterns...\n');

const viewTestFiles = findViewTests(viewTestsDir);
console.log(`Found ${viewTestFiles.length} view test files\n`);

viewTestFiles.forEach(filePath => {
  const fileName = path.basename(filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Apply fixes
  content = fixHandlerMocks(content);
  content = fixStatusSelectors(content);
  checkDataArrays(filePath, content);

  // Write back if changed
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${fileName} - Fixed`);
    filesFixed++;
  } else {
    console.log(`⏭️  ${fileName} - No changes needed`);
    filesSkipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Fixed: ${filesFixed} files`);
console.log(`   ⏭️  Skipped: ${filesSkipped} files`);
console.log(`\n   Patterns Applied:`);
console.log(`   - Handler mocks fixed: ${patternsFixed.handlersFixed}`);
console.log(`   - Status selectors fixed: ${patternsFixed.statusSelectorsFixed}`);
console.log(`\n✨ Done! Run tests to verify fixes.\n`);
