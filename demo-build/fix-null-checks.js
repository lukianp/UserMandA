/**
 * Automated Null Check Fixer
 *
 * Fixes common null reference patterns across all view files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to fix with their replacements
const fixes = [
  // Array length checks
  { pattern: /(\w+)\.length\s*([>=<])/g, replacement: '$1?.length $2' },
  { pattern: /(\w+)\.length\s*===\s*0/g, replacement: '$1?.length === 0' },

  // toLocaleString calls
  { pattern: /(\w+)\.toLocaleString\(\)/g, replacement: '$1?.toLocaleString?.() ?? \'N/A\'' },

  // Property access patterns
  { pattern: /(\w+)\.total\b/g, replacement: '$1?.total ?? 0' },
  { pattern: /(\w+)\.searchText\b/g, replacement: '$1?.searchText ?? \'\'' },
  { pattern: /(\w+)\.tenantId\b/g, replacement: '$1?.tenantId ?? \'\'' },

  // Map calls
  { pattern: /(\w+)\.map\(/g, replacement: '$1?.map(' },
  { pattern: /(\w+)\.filter\(/g, replacement: '$1?.filter(' },
  { pattern: /(\w+)\.slice\(/g, replacement: '$1?.slice(' },
];

// Files to process
const viewFiles = glob.sync('src/renderer/views/**/*.tsx', { cwd: __dirname });

let totalChanges = 0;

viewFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  let fileChanges = 0;

  fixes.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      // Only replace if not already using optional chaining
      content = content.replace(pattern, (match, group1, group2) => {
        if (match.includes('?')) {
          return match; // Already has optional chaining
        }
        const replaced = replacement.replace('$1', group1);
        if (group2) {
          return replaced.replace('$2', group2);
        }
        return replaced;
      });

      if (content !== originalContent) {
        fileChanges++;
      }
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalChanges++;
    console.log(`✓ Fixed ${filePath} (${fileChanges} patterns)`);
  }
});

console.log(`\n✅ Fixed ${totalChanges} files`);
