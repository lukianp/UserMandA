#!/usr/bin/env node
/**
 * Comprehensive null safety fix for all view components
 * Fixes patterns like:
 * - stats.servicesByProvider.azure -> (stats?.servicesByProvider?.azure ?? 0)
 * - stats.total -> (stats?.total ?? 0)
 * - data.items.length -> (data?.items?.length ?? 0)
 * - value.toFixed(2) -> (typeof value === 'number' ? value : 0).toFixed(2)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all view component files (exclude tests)
const viewFiles = glob.sync('src/renderer/views/**/*.tsx', {
  cwd: __dirname,
  ignore: ['**/*.test.tsx', '**/*.spec.tsx']
});

console.log(`Found ${viewFiles.length} view files to process\n`);

let totalFixed = 0;

viewFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let fileFixed = 0;

  // Pattern 1: Fix stats.property.subproperty (nested object access)
  // Convert stats.servicesByProvider.azure to (stats?.servicesByProvider?.azure ?? 0)
  content = content.replace(
    /\bstats\.(\w+)\.(\w+)\b(?!\?)/g,
    (match, p1, p2) => {
      // Skip if already using optional chaining
      if (match.includes('?')) return match;
      fileFixed++;
      return `(stats?.${p1}?.${p2} ?? 0)`;
    }
  );

  // Pattern 2: Fix stats['property']['subproperty'] (bracket notation)
  content = content.replace(
    /\bstats\[['"]([^'"]+)['"]\]\[['"]([^'"]+)['"]\]/g,
    (match, p1, p2) => {
      fileFixed++;
      return `(stats?.${p1}?.${p2} ?? 0)`;
    }
  );

  // Pattern 3: Fix stats.property (single level access)
  // Only if not already using optional chaining
  content = content.replace(
    /\bstats\.(\w+)\b(?!\?|\.)/g,
    (match, p1) => {
      // Skip if it's stats.? or already has optional chaining
      if (match.includes('?')) return match;
      // Skip if it's part of a longer chain (already handled above)
      return `(stats?.${p1} ?? 0)`;
    }
  );

  // Pattern 4: Fix .toFixed() calls without null safety
  content = content.replace(
    /(\w+)\.toFixed\((\d+)\)/g,
    (match, varName, decimals) => {
      // Check if already wrapped in typeof check
      const beforeMatch = content.substring(
        Math.max(0, content.indexOf(match) - 50),
        content.indexOf(match)
      );
      if (beforeMatch.includes(`typeof ${varName} === 'number'`)) {
        return match; // Already safe
      }
      fileFixed++;
      return `(typeof ${varName} === 'number' ? ${varName} : 0).toFixed(${decimals})`;
    }
  );

  // Pattern 5: Fix .length accesses on potentially undefined arrays
  content = content.replace(
    /(\w+)\.length(?!\?)/g,
    (match, varName) => {
      // Common array-like variable names
      if (['items', 'data', 'results', 'rows', 'entries', 'logs'].includes(varName)) {
        fileFixed++;
        return `(Array.isArray(${varName}) ? ${varName}.length : 0)`;
      }
      return match;
    }
  );

  // Pattern 6: Fix config.property accesses
  content = content.replace(
    /\bconfig\.(\w+)\.(\w+)\b(?!\?)/g,
    (match, p1, p2) => {
      if (match.includes('?')) return match;
      fileFixed++;
      return `(config?.${p1}?.${p2} ?? '')`;
    }
  );

  // Pattern 7: Fix result.property accesses
  content = content.replace(
    /\bresult\.(\w+)\.(\w+)\b(?!\?)/g,
    (match, p1, p2) => {
      if (match.includes('?')) return match;
      fileFixed++;
      return `(result?.${p1}?.${p2} ?? 0)`;
    }
  );

  // Only write if changes were made
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${fileFixed} issues in ${file}`);
    totalFixed += fileFixed;
  }
});

console.log(`\n✅ Total fixes applied: ${totalFixed} across ${viewFiles.length} files`);
