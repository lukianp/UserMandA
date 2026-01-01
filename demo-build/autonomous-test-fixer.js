const fs = require('fs');
const path = require('path');

console.log('=== AUTONOMOUS TEST FIXER ===');
console.log('Systematically fixing null safety, async timing, and mock issues\n');

const fixes = {
  nullSafety: 0,
  asyncTiming: 0,
  mockIssues: 0,
  totalFiles: 0
};

// === PHASE 1: Fix Discovery Hooks - Null Safety ===
console.log('PHASE 1: Fixing null safety in discovery hooks...\n');

const hooksToFix = [
  'src/renderer/hooks/useTeamsDiscoveryLogic.ts',
  'src/renderer/hooks/useSharePointDiscoveryLogic.ts',
  'src/renderer/hooks/useExchangeDiscoveryLogic.ts',
  'src/renderer/hooks/useFileSystemDiscoveryLogic.ts',
  'src/renderer/hooks/useAWSDiscoveryLogic.ts',
  'src/renderer/hooks/useAzureDiscoveryLogic.ts',
  'src/renderer/hooks/useActiveDirectoryDiscoveryLogic.ts',
  'src/renderer/hooks/useSQLServerDiscoveryLogic.ts',
  'src/renderer/hooks/useVMwareDiscoveryLogic.ts',
  'src/renderer/hooks/useNetworkDiscoveryLogic.ts'
];

hooksToFix.forEach(hookPath => {
  const fullPath = path.join(__dirname, hookPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ Skipping ${path.basename(hookPath)} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  let fileFixCount = 0;

  // Fix 1: Array length access - add null safety
  const lengthMatches = content.match(/(\w+)\.length/g);
  if (lengthMatches) {
    // Be careful not to replace string literals or already safe patterns
    content = content.replace(
      /(\s+const\s+\w+\s*=\s*)(\w+)(\.length)(?!\s*\?\?)/g,
      (match, prefix, varName, suffix) => {
        if (varName.match(/^(result|data|items|list|array|collection)/i)) {
          fileFixCount++;
          return `${prefix}(${varName}${suffix} ?? 0)`;
        }
        return match;
      }
    );
  }

  // Fix 2: Array methods (filter, map, reduce, etc.) - add null safety
  content = content.replace(
    /(\s+const\s+\w+\s*=\s*)(\w+)(\.(?:filter|map|reduce|forEach|find|some|every)\()/g,
    (match, prefix, varName, suffix) => {
      if (varName.match(/^(result|data|items|list|array|collection)/i) && !match.includes('??')) {
        fileFixCount++;
        return `${prefix}(${varName} ?? [])${suffix}`;
      }
      return match;
    }
  );

  // Fix 3: Numeric operations (toFixed, toPrecision) - add null safety
  content = content.replace(
    /(\s+const\s+\w+\s*=\s*)(\w+)(\.(?:toFixed|toPrecision)\()/g,
    (match, prefix, varName, suffix) => {
      if (varName.match(/^(percent|value|count|total|average)/i) && !match.includes('??')) {
        fileFixCount++;
        return `${prefix}(${varName} ?? 0)${suffix}`;
      }
      return match;
    }
  );

  // Fix 4: Object property access - add optional chaining where missing
  content = content.replace(
    /(\w+)\.(\w+)\.(\w+)(?!\?\.)/g,
    (match, obj, prop1, prop2) => {
      if (obj.match(/^(result|data|response|config)/i) && !match.includes('?.')) {
        fileFixCount++;
        return `${obj}?.${prop1}?.${prop2}`;
      }
      return match;
    }
  );

  // Fix 5: CSV generation - ensure arrays are safe
  content = content.replace(
    /rows\.push\(\[([^\]]+)\]\);/g,
    (match) => {
      if (!match.includes('??')) {
        fileFixCount++;
        return match.replace(/(\w+)(?=\s*[,\]])/g, (m) => {
          if (m.match(/^(item|row|data|result)/)) {
            return `${m} ?? ''`;
          }
          return m;
        });
      }
      return match;
    }
  );

  if (content !== original) {
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Fixed ${fileFixCount} null safety issues in ${path.basename(hookPath)}`);
    fixes.nullSafety += fileFixCount;
    fixes.totalFiles++;
  }
});

console.log(`\nNull safety fixes: ${fixes.nullSafety} issues across ${fixes.totalFiles} files\n`);

// === PHASE 2: Fix Discovery Hook Tests - Async Timing ===
console.log('PHASE 2: Fixing async timing in hook tests...\n');

const hookTestsToFix = hooksToFix.map(h => h.replace('.ts', '.test.ts'));

hookTestsToFix.forEach(testPath => {
  const fullPath = path.join(__dirname, testPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ Skipping ${path.basename(testPath)} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  let fileFixCount = 0;

  // Fix 1: Ensure waitFor is imported
  if (!content.includes('import { waitFor }') && !content.includes('import {waitFor}')) {
    if (content.includes("from '@testing-library/react'")) {
      content = content.replace(
        /import\s*{\s*([^}]+?)\s*}\s*from\s*'@testing-library\/react';/,
        (match, imports) => {
          if (!imports.includes('waitFor')) {
            fileFixCount++;
            return `import { ${imports}, waitFor } from '@testing-library/react';`;
          }
          return match;
        }
      );
    }
  }

  // Fix 2: Add waitFor after async operations that check isDiscovering
  const asyncDiscoveryPattern = /(await act\(async \(\) => \{[\s\n]*await result\.current\.\w+\(\);[\s\n]*\}\);)([\s\n]*)(expect\(result\.current\.isDiscovering\)\.toBe\((false|true)\);)/g;
  if (asyncDiscoveryPattern.test(content)) {
    content = content.replace(
      asyncDiscoveryPattern,
      (match, actBlock, whitespace, expectStatement, _boolValue) => {
        if (!match.includes('waitFor')) {
          fileFixCount++;
          return `${actBlock}\n\n    await waitFor(() => {\n      ${expectStatement}\n    });`;
        }
        return match;
      }
    );
  }

  // Fix 3: Add waitFor for result checks after async operations
  const asyncResultPattern = /(await act\(async \(\) => \{[\s\n]*await result\.current\.\w+\(\);[\s\n]*\}\);)([\s\n]*)(expect\(result\.current\.result\)\.)/g;
  if (asyncResultPattern.test(content)) {
    content = content.replace(
      asyncResultPattern,
      (match, actBlock, whitespace, expectStart) => {
        if (!match.includes('waitFor')) {
          fileFixCount++;
          return `${actBlock}\n\n    await waitFor(() => {\n      ${expectStart}`;
        }
        return match;
      }
    );
  }

  if (content !== original) {
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Fixed ${fileFixCount} async timing issues in ${path.basename(testPath)}`);
    fixes.asyncTiming += fileFixCount;
  }
});

console.log(`\nAsync timing fixes: ${fixes.asyncTiming} issues\n`);

// === PHASE 3: Fix View Tests - Add data-cy attributes ===
console.log('PHASE 3: Adding data-cy attributes to views...\n');

const viewsToFix = [
  'src/renderer/views/discovery/SQLServerDiscoveryView.tsx',
  'src/renderer/views/discovery/VMwareDiscoveryView.tsx',
  'src/renderer/views/users/UsersView.tsx'
];

const dataCyMappings = [
  { pattern: /onClick={handleExport}(?!\s+data-cy)/, attr: 'data-cy="export-results-btn"' },
  { pattern: /onClick={cancelDiscovery}(?!\s+data-cy)/, attr: 'data-cy="cancel-discovery-btn"' },
  { pattern: /onClick={startDiscovery}(?!\s+data-cy)/, attr: 'data-cy="start-discovery-btn"' },
  { pattern: /onClick={refreshData}(?!\s+data-cy)/, attr: 'data-cy="refresh-data-btn"' },
  { pattern: /onClick={clearFilters}(?!\s+data-cy)/, attr: 'data-cy="clear-filters-btn"' }
];

viewsToFix.forEach(viewPath => {
  const fullPath = path.join(__dirname, viewPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ Skipping ${path.basename(viewPath)} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  let fileFixCount = 0;

  dataCyMappings.forEach(({ pattern, attr }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, (match) => {
        fileFixCount++;
        return `${match} ${attr}`;
      });
    }
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Added ${fileFixCount} data-cy attributes to ${path.basename(viewPath)}`);
    fixes.mockIssues += fileFixCount;
  }
});

console.log(`\ndata-cy attributes added: ${fixes.mockIssues}\n`);

// === SUMMARY ===
console.log('=== FIX SUMMARY ===');
console.log(`Null Safety Issues Fixed: ${fixes.nullSafety}`);
console.log(`Async Timing Issues Fixed: ${fixes.asyncTiming}`);
console.log(`data-cy Attributes Added: ${fixes.mockIssues}`);
console.log(`Total Files Modified: ${fixes.totalFiles}`);
console.log('\nRun tests to validate improvements!');
