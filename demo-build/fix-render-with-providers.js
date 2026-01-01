/**
 * Automated script to replace render() with renderWithProviders()
 * in all view test files that have useNavigate context errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Fixing render() → renderWithProviders() ===\n');

// Find all view test files
const viewTestFiles = execSync(
  'find src/renderer/views -name "*.test.tsx" -type f',
  { encoding: 'utf-8', cwd: __dirname }
).trim().split('\n');

console.log(`Found ${viewTestFiles.length} view test files\n`);

let fixedCount = 0;
let skippedCount = 0;
let errorCount = 0;

viewTestFiles.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf-8');

    // Skip if already using renderWithProviders
    if (content.includes('renderWithProviders as render')) {
      console.log(`✓ Already fixed: ${filePath}`);
      skippedCount++;
      return;
    }

    // Skip if doesn't import render from @testing-library
    if (!content.includes("from '@testing-library/react'")) {
      console.log(`- Skip (no RTL import): ${filePath}`);
      skippedCount++;
      return;
    }

    let modified = false;

    // Pattern 1: import { render, ... } from '@testing-library/react';
    // Replace with: import { renderWithProviders as render, ... } from '../../test-utils/testWrappers';
    const importPattern1 = /import\s*\{\s*render\s*,\s*([^}]+)\}\s*from\s*['"]@testing-library\/react['"]/;
    if (importPattern1.test(content)) {
      content = content.replace(
        importPattern1,
        "import { renderWithProviders as render, $1} from '../../test-utils/testWrappers'"
      );
      modified = true;
    }

    // Pattern 2: import { ..., render, ... } from '@testing-library/react';
    const importPattern2 = /import\s*\{\s*([^}]*),\s*render\s*,\s*([^}]+)\}\s*from\s*['"]@testing-library\/react['"]/;
    if (importPattern2.test(content)) {
      content = content.replace(
        importPattern2,
        "import { renderWithProviders as render, $1, $2} from '../../test-utils/testWrappers'"
      );
      modified = true;
    }

    // Pattern 3: import { ..., render } from '@testing-library/react';
    const importPattern3 = /import\s*\{\s*([^}]+),\s*render\s*\}\s*from\s*['"]@testing-library\/react['"]/;
    if (importPattern3.test(content)) {
      content = content.replace(
        importPattern3,
        "import { renderWithProviders as render, $1} from '../../test-utils/testWrappers'"
      );
      modified = true;
    }

    // Pattern 4: import { render } from '@testing-library/react';
    const importPattern4 = /import\s*\{\s*render\s*\}\s*from\s*['"]@testing-library\/react['"]/;
    if (importPattern4.test(content)) {
      content = content.replace(
        importPattern4,
        "import { renderWithProviders as render } from '../../test-utils/testWrappers'"
      );
      modified = true;
    }

    // Fix path depth based on file location
    const depth = filePath.split('/').length - 3; // Adjust for src/renderer/views
    let testUtilsPath = '../'.repeat(depth) + 'test-utils/testWrappers';
    content = content.replace(/['"]\.\.\/\.\.\/test-utils\/testWrappers['"]/g, `'${testUtilsPath}'`);

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✓ Fixed: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`- No change: ${filePath}`);
      skippedCount++;
    }
  } catch (error) {
    console.log(`✗ Error: ${filePath} - ${error.message}`);
    errorCount++;
  }
});

console.log('\n========== Summary ==========');
console.log(`Fixed: ${fixedCount}`);
console.log(`Skipped: ${skippedCount}`);
console.log(`Errors: ${errorCount}`);
console.log(`\nRe-run tests to verify improvements!`);
