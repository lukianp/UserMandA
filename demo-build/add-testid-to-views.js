/**
 * Add data-testid attributes to view files based on existing data-cy
 * This makes tests work with getByTestId while keeping data-cy for Cypress
 */

const fs = require('fs');
const path = require('path');

function addTestIdToFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Find all data-cy attributes and add corresponding data-testid
  // Pattern: data-cy="something"
  const dataCyPattern = /data-cy="([^"]+)"/g;

  const matches = content.matchAll(dataCyPattern);
  for (const match of matches) {
    const fullMatch = match[0];
    const cyValue = match[1];

    // Check if data-testid already exists nearby
    const index = content.indexOf(fullMatch);
    const contextBefore = content.substring(Math.max(0, index - 200), index);
    const contextAfter = content.substring(index, Math.min(content.length, index + 200));

    // If data-testid not in same element, add it
    if (!contextBefore.includes('data-testid') && !contextAfter.includes('data-testid')) {
      // Replace data-cy="value" with data-cy="value" data-testid="value"
      const replacement = `${fullMatch} data-testid="${cyValue}"`;
      content = content.replace(fullMatch, replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let processedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      processedCount += processDirectory(fullPath);
    } else if (file.endsWith('View.tsx') || file.endsWith('DiscoveryView.tsx')) {
      console.log(`Processing ${file}...`);
      if (addTestIdToFile(fullPath)) {
        console.log(`  ✓ Added data-testid attributes`);
        processedCount++;
      } else {
        console.log(`  - No changes needed`);
      }
    }
  }

  return processedCount;
}

const viewsDir = path.join(__dirname, 'src', 'renderer', 'views');
console.log('Adding data-testid to view files...\n');
const count = processDirectory(viewsDir);
console.log(`\nProcessed ${count} files with changes`);
