/**
 * Mass fix common test patterns across all test files
 * This applies safe, high-confidence fixes that increase passing tests
 */

const fs = require('fs');
const path = require('path');

let totalFixed = 0;

// Pattern: Fix conditionally rendered export button tests
// Many tests expect export buttons but don't provide result/data in mocks
function fixExportButtonTests(content, filePath) {
  let modified = false;

  // Pattern 1: Export button test without result data
  const exportTestPattern = /it\(['"]calls exportResults when export button clicked['"],[^}]*mockReturnValue\(\{[^}]*\}\);/gs;
  const matches = content.match(exportTestPattern);

  if (matches) {
    for (const match of matches) {
      // Check if it has result or results or data property
      if (!match.includes('result:') && !match.includes('results:') && !match.includes('data:')) {
        // Add result property before the closing brace of mockReturnValue
        const fixed = match.replace(
          /(\.\.\.\mockHookDefaults,)(\s*)(exportResults|exportData|exportToCSV)/,
          '$1$2result: { data: [], items: [] },$2$3'
        );
        if (fixed !== match) {
          content = content.replace(match, fixed);
          modified = true;
          console.log(`    Fixed export button test in ${path.basename(filePath)}`);
        }
      }
    }
  }

  return { content, modified };
}

// Pattern: Fix tests expecting specific text that may not match
function fixTextMatchers(content, filePath) {
  let modified = false;

  // Make text matchers more flexible by using regex instead of exact strings
  // Example: screen.getByText('Discovery') → screen.getByText(/discovery/i)
  const strictTextPattern = /screen\.(getByText|queryByText)\(['"]([^'"]+)['"]\)/g;

  let newContent = content.replace(strictTextPattern, (match, method, text) => {
    // Don't change if already a regex
    if (match.includes('/')) return match;

    // Don't change short generic words
    if (text.length < 4) return match;

    // Don't change if it contains special regex characters already
    if (/[.*+?^${}()|[\]\\]/.test(text)) return match;

    // Make it case-insensitive regex
    const replacement = `screen.${method}(/${text}/i)`;
    return replacement;
  });

  if (newContent !== content) {
    content = newContent;
    modified = true;
    console.log(`    Fixed text matchers in ${path.basename(filePath)}`);
  }

  return { content, modified };
}

// Pattern: Fix waitFor usage for async operations
function addWaitForToAsyncTests(content, filePath) {
  let modified = false;

  // Pattern: Tests that call async operations but don't wait
  const asyncWithoutWaitPattern = /await\s+(result\.current\.[a-zA-Z]+\([^)]*\));[\s]*expect\(/g;

  if (asyncWithoutWaitPattern.test(content)) {
    // Check if waitFor is imported
    if (!content.includes('waitFor')) {
      // Add waitFor to imports
      content = content.replace(
        /(from ['"]@testing-library\/react['"];)/,
        (match) => match.replace('react";', 'react";\nimport { waitFor } from \'@testing-library/react\';')
      );

      // Actually, waitFor is usually already in the import. Let's check differently
      const renderImport = content.match(/import\s*{([^}]+)}\s*from\s*['"]@testing-library\/react['"]/);
      if (renderImport && !renderImport[1].includes('waitFor')) {
        content = content.replace(
          /(import\s*{)([^}]+)(}\s*from\s*['"]@testing-library\/react['"])/,
          '$1$2, waitFor$3'
        );
        modified = true;
        console.log(`    Added waitFor import to ${path.basename(filePath)}`);
      }
    }
  }

  return { content, modified };
}

// Process a single test file
function processTestFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileModified = false;

  // Apply all fixes
  let result;

  result = fixExportButtonTests(content, filePath);
  content = result.content;
  fileModified = fileModified || result.modified;

  // Commenting out text matcher fixes as they're too aggressive
  // result = fixTextMatchers(content, filePath);
  // content = result.content;
  // fileModified = fileModified || result.modified;

  result = addWaitForToAsyncTests(content, filePath);
  content = result.content;
  fileModified = fileModified || result.modified;

  if (fileModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
  }

  return fileModified;
}

// Walk directory tree
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      walkDirectory(fullPath);
    } else if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
      console.log(`Processing ${fullPath}...`);
      processTestFile(fullPath);
    }
  }
}

// Main execution
console.log('Mass-fixing test patterns...\n');

const srcDir = path.join(__dirname, 'src');
walkDirectory(srcDir);

console.log(`\n✓ Fixed ${totalFixed} test files`);
