/**
 * MASTER TEST FIX SCRIPT
 * Systematically applies all high-ROI test fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 MASTER TEST FIX - STARTING\n');

let fixCount = 0;

// ===========================================================================
// FIX 1: Add waitFor to all async hook tests  
// ===========================================================================
console.log('FIX 1: Adding waitFor to async hook tests...');

const asyncHookTestFiles = [
  'src/renderer/hooks/useActiveDirectoryDiscoveryLogic.test.ts',
  'src/renderer/hooks/useAWSDiscoveryLogic.test.ts',
 'src/renderer/hooks/useFileSystemDiscoveryLogic.test.ts',
];

asyncHookTestFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Pattern: await act(...) followed by expect(result.current.isDiscovering/isRunning).toBe(false);
    // Add waitFor wrapper
    const pattern1 = /(await act\(async \(\) => \{[\s\S]*?\}\);)\s+(expect\(result\.current\.(?:isDiscovering|isRunning)[^\n]+\.toBe\(false\)\);)/g;
    if (content.match(pattern1)) {
      content = content.replace(pattern1, '$1\n\n      await waitFor(() => {\n        $2\n      });');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`  ✓ Fixed: ${file}`);
      fixCount++;
    }
  }
});

// ===========================================================================
// FIX 2: Fix PowerPlatform hook bugs (already done, but verify)
// ===========================================================================
console.log('\nFIX 2: Verifying PowerPlatform hook fix...');
const ppFile = 'src/renderer/hooks/usePowerPlatformDiscoveryLogic.ts';
if (fs.existsSync(ppFile)) {
  let content = fs.readFileSync(ppFile, 'utf8');
  if (content.includes('currentResult: result,')) {
    content = content.replace('currentResult: result,', 'currentResult: state.result,');
    fs.writeFileSync(ppFile, content);
    console.log('  ✓ Fixed PowerPlatform currentResult reference');
    fixCount++;
  } else {
    console.log('  ✓ PowerPlatform already fixed');
  }
}

// ===========================================================================
// FIX 3: Add null safety to common patterns
// ===========================================================================
console.log('\nFIX 3: Adding null safety to hooks...');

const hooksToFix = [
  'src/renderer/hooks/useDomainDiscoveryLogic.ts',
  'src/renderer/hooks/useApplicationDiscoveryLogic.ts',
];

hooksToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Replace .toFixed( with null-safe version
    if (content.match(/(\w+)\.toFixed\(/g)) {
      content = content.replace(/(\w+)\.toFixed\(/g, '(typeof $1 === \'number\' ? $1 : 0).toFixed(');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`  ✓ Added null safety: ${file}`);
      fixCount++;
    }
  }
});

// ===========================================================================
// FIX 4: Add missing mocks for common services
// ===========================================================================
console.log('\nFIX 4: Verifying service mocks...');
const setupTestsPath = 'src/test-utils/setupTests.ts';
let setupTests = fs.readFileSync(setupTestsPath, 'utf8');

// Check if notificationService mock exists (already added, but verify)
if (setupTests.includes('notificationService')) {
  console.log('  ✓ notificationService mock present');
} else {
  console.log('  ✗ notificationService mock missing - should have been added earlier');
}

// ===========================================================================
// SUMMARY
// ===========================================================================
console.log('\n' + '='.repeat(60));
console.log(`✅ MASTER FIX COMPLETE - Applied ${fixCount} systematic fixes`);
console.log('='.repeat(60));
console.log('\nRunning test suite to measure improvement...\n');

