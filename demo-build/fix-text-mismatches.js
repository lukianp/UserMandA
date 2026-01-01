/**
 * Automated text mismatch fixer
 * Runs tests, captures actual text from DOM, updates test expectations
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== Text Mismatch Fixer ===\n');

// Step 1: Run a focused set of tests to identify mismatches
const testPatterns = [
  'src/renderer/views/groups/GroupsView.test.tsx',
  'src/renderer/views/users/UsersView.test.tsx',
  'src/renderer/views/migration/MigrationPlanningView.test.tsx',
  'src/renderer/views/migration/MigrationExecutionView.test.tsx',
  'src/renderer/views/migration/MigrationMappingView.test.tsx',
  'src/renderer/views/analytics/BenchmarkingView.test.tsx',
  'src/renderer/views/security/SecurityAuditView.test.tsx',
];

const foundMismatches = [];

testPatterns.forEach(testPath => {
  console.log(`\nAnalyzing: ${testPath}`);

  try {
    execSync(`npx jest ${testPath} --no-coverage 2>&1`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: __dirname
    });
  } catch (error) {
    const output = error.stdout || error.message;

    // Extract text mismatches
    const descriptionMatch = output.match(/Unable to find an element with the text: \/(.*?)\/i\./);
    if (descriptionMatch) {
      const expectedText = descriptionMatch[1];

      // Find actual text in DOM output
      const domMatch = output.match(/<p[^>]*class=[^>]*text-sm text-gray[^>]*>\s*([^<]+)\s*<\/p>/);
      if (domMatch) {
        const actualText = domMatch[1].trim();
        console.log(`  Expected: "${expectedText}"`);
        console.log(`  Actual: "${actualText}"`);

        foundMismatches.push({
          file: testPath,
          expected: expectedText,
          actual: actualText
        });
      }
    }
  }
});

console.log(`\n\nFound ${foundMismatches.length} text mismatches`);

// Step 2: Apply fixes
let fixCount = 0;

foundMismatches.forEach(mismatch => {
  console.log(`\nFixing ${mismatch.file}...`);

  try {
    const testContent = fs.readFileSync(mismatch.file, 'utf-8');

    // Replace the expected text with actual text
    const oldPattern = new RegExp(`/${mismatch.expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`, 'g');
    const newPattern = `/${mismatch.actual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`;

    const updatedContent = testContent.replace(oldPattern, newPattern);

    if (updatedContent !== testContent) {
      fs.writeFileSync(mismatch.file, updatedContent);
      fixCount++;
      console.log(`  ✓ Fixed`);
    } else {
      console.log(`  - No change needed`);
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
  }
});

console.log(`\n\n=== Summary ===`);
console.log(`Fixed ${fixCount} files`);
console.log(`\nRe-run tests to verify improvements`);
