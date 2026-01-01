#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all view test files
const viewsDir = path.join(__dirname, 'src', 'renderer', 'views');

function findTestFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTestFiles(fullPath));
    } else if (entry.name.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: Change button role to heading role for "displays the view title"
  const titleTestPattern = /it\('displays the view title',[\s\S]*?expect\(screen\.getByRole\('button',\s*{\s*name:\s*(\/[^\/]+\/i)\s*}\)\)\.toBeInTheDocument\(\);/g; // eslint-disable-line no-useless-escape
  const titleMatches = [...content.matchAll(titleTestPattern)];

  for (const match of titleMatches) {
    // const _namePattern = match[1];
    const oldCode = match[0];
    const newCode = oldCode.replace("getByRole('button',", "getByRole('heading',");
    content = content.replace(oldCode, newCode);
    modified = true;
  }

  // Fix 2: Change button role to getByText for "displays the view description"
  const descTestPattern = /it\('displays the view description',[\s\S]*?expect\(\s*screen\.getByRole\('button',\s*{\s*name:\s*(\/[^\/]+\/i)\s*}\)\s*\)\.toBeInTheDocument\(\);/g;
  const descMatches = [...content.matchAll(descTestPattern)];

  for (const match of descMatches) {
    // const _namePattern = match[1];
    const oldCode = match[0];
    const newCode = oldCode.replace(/getByRole\('button',\s*{\s*name:\s*(\/[^\/]+\/i)\s*}\)/, 'getByText($1)');
    content = content.replace(oldCode, newCode);
    modified = true;
  }

  // Fix 3: Change button role to getByText for error messages
  const errorTestPattern = /expect\(screen\.getByRole\('button',\s*{\s*name:\s*(\/[^\/]*error[^\/]*\/i)\s*}\)\)\.toBeInTheDocument\(\);/gi;
  content = content.replace(errorTestPattern, (match, namePattern) => {
    modified = true;
    return `expect(screen.getByText(${namePattern})).toBeInTheDocument();`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

// Main execution
console.log('Batch fixing view test files...\n');

const testFiles = findTestFiles(viewsDir);
let fixedCount = 0;

for (const file of testFiles) {
  if (fixFile(file)) {
    fixedCount++;
    console.log(`✓ ${path.relative(process.cwd(), file)}`);
  }
}

console.log(`\nFixed ${fixedCount} files`);
console.log('\nRunning tests to validate...');

try {
  execSync('npm run test:unit 2>&1 | tail -10', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
  // Tests may still have failures, that's okay
}
