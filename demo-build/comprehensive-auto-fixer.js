const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== COMPREHENSIVE AUTO-FIXER ===\n');
console.log('Running comprehensive test fixes...\n');

// Get current test count
console.log('1. Getting baseline...');
const startResult = execSync('npm run test:unit -- --json --outputFile=auto-fix-start.json --no-cache 2>&1', {
  cwd: __dirname,
  encoding: 'utf8'
});
const startMatch = startResult.match(/(\d+) passed/);
const startPassing = startMatch ? parseInt(startMatch[1]) : 0;
console.log(`   Baseline: ${startPassing} tests passing\n`);

// Fix 1: Add missing jest.fn() mocks for common function patterns
console.log('2. Fixing null function mocks...');
const testFiles = execSync('find src/renderer -name "*.test.tsx" -o -name "*.test.ts"', {
  cwd: __dirname,
  encoding: 'utf8'
}).trim().split('\n');

let fixCount = 0;
testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix null function mocks
  content = content.replace(/(\s+)(handle\w+|on\w+|start\w+|cancel\w+|refresh\w+|export\w+):\s*null,/g, '$1$2: jest.fn(),');
  content = content.replace(/(\s+)(set\w+):\s*null,/g, '$1$2: jest.fn(),');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixCount++;
  }
});
console.log(`   Fixed ${fixCount} test files\n`);

// Fix 2: Add missing imports
console.log('3. Checking for missing createUniversalStats imports...');
const missingImports = execSync('grep -l "createUniversalStats" src/renderer/**/*.test.* 2>/dev/null || echo ""', {
  cwd: __dirname,
  encoding: 'utf8'
}).trim().split('\n').filter(Boolean);

let importFixCount = 0;
missingImports.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already imported
  if (content.includes('createUniversalStats') && !content.match(/import.*createUniversalStats/)) {
    // Add import if missing
    const importLine = "import { createUniversalStats } from '../../test-utils/universalDiscoveryMocks';";
    if (!content.includes(importLine)) {
      content = content.replace(
        /(import.*from.*['"]react['"];?\s*\n)/,
        `$1${importLine}\n`
      );
      fs.writeFileSync(filePath, content, 'utf8');
      importFixCount++;
    }
  }
});
console.log(`   Fixed ${importFixCount} missing imports\n`);

// Fix 3: Add data-testid to export buttons
console.log('4. Adding data-testid to export buttons...');
const viewFiles = execSync('find src/renderer/views -name "*.tsx" ! -name "*.test.tsx"', {
  cwd: __dirname,
  encoding: 'utf8'
}).trim().split('\n');

let buttonFixCount = 0;
viewFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Add data-testid to export buttons that don't have it
  content = content.replace(
    /(<Button[^>]*variant="[^"]*"[^>]*>[\s\n]*Export)/g,
    (match) => {
      if (!match.includes('data-testid')) {
        return match.replace('<Button', '<Button data-testid="export-results-btn" data-cy="export-results-btn"');
      }
      return match;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    buttonFixCount++;
  }
});
console.log(`   Fixed ${buttonFixCount} export buttons\n`);

// Run tests again
console.log('5. Running tests to check progress...');
const endResult = execSync('npm run test:unit -- --json --outputFile=auto-fix-end.json --no-cache 2>&1', {
  cwd: __dirname,
  encoding: 'utf8'
});
const endMatch = endResult.match(/(\d+) passed/);
const endPassing = endMatch ? parseInt(endMatch[1]) : 0;

console.log('\n=== RESULTS ===');
console.log(`Starting: ${startPassing} tests passing`);
console.log(`Ending:   ${endPassing} tests passing`);
console.log(`Change:   ${endPassing > startPassing ? '+' : ''}${endPassing - startPassing} tests`);
console.log(`\nTarget: 2937 tests (95%)`);
console.log(`Gap:    ${2937 - endPassing} tests remaining`);
