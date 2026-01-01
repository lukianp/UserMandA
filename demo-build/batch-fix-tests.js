const fs = require('fs');
const path = require('path');

// Read detailed failure analysis
// const failures = JSON.parse(fs.readFileSync('./failure-analysis-detailed.json', 'utf8'));

console.log('=== BATCH TEST FIXER ===\n');
console.log('This script will systematically fix the most common test failures.\n');

// Track fixes
const fixes = {
  nullSafety: 0,
  asyncTiming: 0,
  textMismatch: 0,
  mockIssues: 0
};

// Priority 1: Fix null safety in top failing hooks
console.log('PRIORITY 1: Fixing null safety in discovery hooks...\n');

const hooksToFix = [
  'src/renderer/hooks/useTeamsDiscoveryLogic.ts',
  'src/renderer/hooks/useSharePointDiscoveryLogic.ts',
  'src/renderer/hooks/useExchangeDiscoveryLogic.ts',
  'src/renderer/hooks/useFileSystemDiscoveryLogic.ts'
];

hooksToFix.forEach(hookPath => {
  const fullPath = path.join(__dirname, hookPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Pattern 1: Fix array length access
    const pattern1 = /(\w+)\.length/g;
    const matches1 = content.match(pattern1);
    if (matches1) {
      content = content.replace(
        /const total = (\w+)\.length/g,
        'const total = ($1?.length ?? 0)'
      );
      modified = true;
    }

    // Pattern 2: Fix array filter/map
    const pattern2 = /(\w+)\.filter\(/g;
    if (pattern2.test(content)) {
      content = content.replace(
        /const filtered = (\w+)\.filter\(/g,
        'const filtered = ($1 ?? []).filter('
      );
      modified = true;
    }

    // Pattern 3: Fix numeric operations
    const pattern3 = /(\w+)\.toFixed\(/g;
    if (pattern3.test(content)) {
      content = content.replace(
        /const percentage = (\w+)\.toFixed\(/g,
        'const percentage = ($1 ?? 0).toFixed('
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✓ Fixed null safety in ${path.basename(hookPath)}`);
      fixes.nullSafety++;
    }
  }
});

console.log(`\nNull safety fixes applied: ${fixes.nullSafety}\n`);

// Priority 2: Add async/await patterns to hook tests
console.log('PRIORITY 2: Fixing async timing in hook tests...\n');

const hookTestsToFix = [
  'src/renderer/hooks/useTeamsDiscoveryLogic.test.ts',
  'src/renderer/hooks/useSharePointDiscoveryLogic.test.ts',
  'src/renderer/hooks/useExchangeDiscoveryLogic.test.ts',
  'src/renderer/hooks/useFileSystemDiscoveryLogic.test.ts'
];

hookTestsToFix.forEach(testPath => {
  const fullPath = path.join(__dirname, testPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Check if waitFor is imported
    if (!content.includes('import { waitFor }')) {
      content = content.replace(
        "import { renderHook, act } from '@testing-library/react';",
        "import { renderHook, act, waitFor } from '@testing-library/react';"
      );
      modified = true;
    }

    // Add waitFor after async operations
    const asyncPattern = /await act\(async \(\) => \{[\s\S]*?\}\);[\s\n]*expect\(/g;
    if (asyncPattern.test(content)) {
      content = content.replace(
        /(await act\(async \(\) => \{[\s\S]*?\}\);)([\s\n]*)(expect\(result\.current\.isDiscovering\)\.toBe\(false\);)/g,
        '$1\n\n    await waitFor(() => {\n      $3\n    });'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✓ Fixed async timing in ${path.basename(testPath)}`);
      fixes.asyncTiming++;
    }
  }
});

console.log(`\nAsync timing fixes applied: ${fixes.asyncTiming}\n`);

// Summary
console.log('=== FIX SUMMARY ===');
console.log(`Null Safety: ${fixes.nullSafety} files`);
console.log(`Async Timing: ${fixes.asyncTiming} files`);
console.log(`\nRun tests again to measure improvement.`);
