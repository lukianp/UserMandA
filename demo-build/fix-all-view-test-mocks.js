#!/usr/bin/env node
/**
 * Fix all discovery view test mocks to use universal discovery hooks
 * This prevents null/undefined errors by ensuring all tests have complete mock data
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all view test files
const testFiles = glob.sync('src/renderer/views/**/*.test.tsx', {
  cwd: __dirname,
});

console.log(`Found ${testFiles.length} view test files to fix\n`);

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let modified = false;

  // Step 1: Add universal mock import if not present
  if (!content.includes('universalDiscoveryMocks')) {
    const importRegex = /(import.*from\s+['"]@testing-library\/react['"];?\n)/;
    if (importRegex.test(content)) {
      content = content.replace(
        importRegex,
        "$1import { createUniversalDiscoveryHook } from '../../test-utils/universalDiscoveryMocks';\n"
      );
      modified = true;
    }
  }

  // Step 2: Fix stats object in mockHookDefaults to use createUniversalStats
  // Look for: stats: { ... }
  const statsPattern = /stats:\s*\{[^}]*\}/g;
  if (statsPattern.test(content)) {
    // Import the factory if not already imported
    if (!content.includes('createUniversalStats')) {
      const importLine = content.match(/import.*universalDiscoveryMocks.*\n/);
      if (importLine) {
        content = content.replace(
          /import\s*\{([^}]*)\}\s*from\s*['"].*universalDiscoveryMocks['"]/,
          "import { $1, createUniversalStats } from '../../test-utils/universalDiscoveryMocks'"
        );
      }
    }

    // Replace incomplete stats objects
    content = content.replace(
      /stats:\s*\{[^}]*\}/g,
      'stats: createUniversalStats()'
    );
    modified = true;
  }

  // Step 3: Fix config object
  const configPattern = /config:\s*\{\s*\}/g;
  if (configPattern.test(content)) {
    if (!content.includes('createUniversalConfig')) {
      const importLine = content.match(/import.*universalDiscoveryMocks.*\n/);
      if (importLine) {
        content = content.replace(
          /import\s*\{([^}]*)\}\s*from\s*['"].*universalDiscoveryMocks['"]/,
          "import { $1, createUniversalConfig } from '../../test-utils/universalDiscoveryMocks'"
        );
      }
    }
    content = content.replace(/config:\s*\{\s*\}/g, 'config: createUniversalConfig()');
    modified = true;
  }

  // Step 4: Fix progress object
  const progressPattern = /progress:\s*\{\s*current:\s*0,\s*total:\s*100,\s*message:\s*['"]['"]/g;
  if (progressPattern.test(content)) {
    if (!content.includes('createUniversalProgress')) {
      const importLine = content.match(/import.*universalDiscoveryMocks.*\n/);
      if (importLine) {
        content = content.replace(
          /import\s*\{([^}]*)\}\s*from\s*['"].*universalDiscoveryMocks['"]/,
          "import { $1, createUniversalProgress } from '../../test-utils/universalDiscoveryMocks'"
        );
      }
    }
    content = content.replace(
      /progress:\s*\{\s*current:\s*0,\s*total:\s*100,\s*message:\s*['"]['"]\s*,?\s*percentage:\s*0\s*\}/g,
      'progress: createUniversalProgress()'
    );
    modified = true;
  }

  // Step 5: Replace entire mockHookDefaults with universal hook if it's too incomplete
  // Check if mockHookDefaults has very few properties (less than 10)
  const mockDefaultsMatch = content.match(/const\s+mockHookDefaults\s*=\s*\{([^}]*)\}/s);
  if (mockDefaultsMatch) {
    const propsCount = (mockDefaultsMatch[1].match(/\w+:/g) || []).length;
    if (propsCount < 10) {
      // This mock is too sparse, replace with universal
      content = content.replace(
        /const\s+mockHookDefaults\s*=\s*\{[^}]*\};?/s,
        'const mockHookDefaults = createUniversalDiscoveryHook();'
      );
      modified = true;
    }
  }

  // Only write if changes were made
  if (modified && content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed mocks in ${file}`);
    totalFixed++;
  }
});

console.log(`\n✅ Total test files fixed: ${totalFixed} / ${testFiles.length}`);
