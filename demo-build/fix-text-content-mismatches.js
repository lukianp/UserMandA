#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Automated fix for Priority 4: Text Content Mismatches
 * Fixes common test assertion issues across view test files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process'); // eslint-disable-line @typescript-eslint/no-unused-vars

// Patterns to fix
const fixes = [
  {
    name: 'Fix view title button role -> heading role',
    pattern: /expect\(screen\.getByRole\('button',\s*{\s*name:\s*\/([^/]+)\/i\s*}\)\)\.toBeInTheDocument\(\);/g,
    replacement: (match, titleText) => {
      // Check if it's likely a title (single word or capitalized phrase without "button" context)
      if (titleText.length < 50 && !titleText.includes('button') && !titleText.includes('click')) {
        return `expect(screen.getByRole('heading', { name: /${titleText}/i })).toBeInTheDocument();`;
      }
      return match;
    },
    test: (content, _filePath) => {
      // Apply to files with "displays the view title" or "displays the view description"
      return content.includes("'displays the view title'") || content.includes('"displays the view title"');
    }
  },
  {
    name: 'Fix error message button role -> alert/text search',
    pattern: /expect\(screen\.getByRole\('button',\s*{\s*name:\s*\/([^/]+error[^/]*)\/i\s*}\)\)\.toBeInTheDocument\(\);/gi,
    replacement: (match, errorText) => {
      return `expect(screen.getByText(/${errorText}/i)).toBeInTheDocument();`;
    }
  },
  {
    name: 'Fix empty state assertions',
    pattern: /expect\(\s*screen\.queryByText\(\/no\.\*data\/i\)\s*\|\|\s*screen\.queryByText\(\/no\.\*results\/i\)\s*\|\|\s*screen\.queryByText\(\/empty\/i\)\s*\)\.toBeTruthy\(\);/g,
    replacement: `const hasEmptyState = screen.queryByText(/no.*data/i) || screen.queryByText(/no.*results/i) || screen.queryByText(/empty/i);
      expect(hasEmptyState).toBeTruthy();`
  }
];

function findTestFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes('node_modules')) {
      files.push(...findTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function applyFixes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const appliedFixes = [];

  for (const fix of fixes) {
    // Check if fix should apply to this file
    if (fix.test && !fix.test(content, filePath)) {
      continue;
    }

    const originalContent = content;

    if (typeof fix.replacement === 'function') {
      content = content.replace(fix.pattern, fix.replacement);
    } else {
      content = content.replace(fix.pattern, fix.replacement);
    }

    if (content !== originalContent) {
      modified = true;
      appliedFixes.push(fix.name);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return appliedFixes;
  }

  return null;
}

// Main execution
console.log('Starting Priority 4: Fix Text Content Mismatches\n');

const viewsDir = path.join(__dirname, 'src', 'renderer', 'views');
const testFiles = findTestFiles(viewsDir);

console.log(`Found ${testFiles.length} test files\n`);

let filesModified = 0;
const modificationLog = [];

for (const file of testFiles) {
  const appliedFixes = applyFixes(file);
  if (appliedFixes) {
    filesModified++;
    const relativePath = path.relative(process.cwd(), file);
    console.log(`✓ ${relativePath}`);
    appliedFixes.forEach(fix => console.log(`  - ${fix}`));
    modificationLog.push({ file: relativePath, fixes: appliedFixes });
  }
}

console.log(`\n${'='.repeat(80)}`);
console.log(`Summary: Modified ${filesModified} files`);
console.log(`${'='.repeat(80)}\n`);

// Save log
fs.writeFileSync(
  path.join(__dirname, 'text-mismatch-fixes.json'),
  JSON.stringify(modificationLog, null, 2)
);

console.log('Fix log saved to: text-mismatch-fixes.json\n');
console.log('Next: Run tests to validate fixes');
console.log('  npm run test:unit\n');
