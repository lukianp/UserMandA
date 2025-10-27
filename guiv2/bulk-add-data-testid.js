#!/usr/bin/env node
/**
 * Bulk add data-testid to all discovery views where data-cy exists
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const discoveryViewsPattern = 'src/renderer/views/discovery/*DiscoveryView.tsx';

function addDataTestIdAttributes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern: data-cy="X" but missing data-testid="X"
  const dataCyPattern = /data-cy="([^"]+)"/g;

  let match;
  const replacements = [];

  while ((match = dataCyPattern.exec(content)) !== null) {
    const dataCyValue = match[1];
    const fullMatch = match[0];
    const startIndex = match.index;

    // Check if data-testid already exists for this element
    // Look ahead up to 200 characters to see if data-testid exists
    const contextAfter = content.substring(startIndex, startIndex + 200);

    if (!contextAfter.includes(`data-testid="${dataCyValue}"`)) {
      replacements.push({
        old: fullMatch,
        new: `${fullMatch} data-testid="${dataCyValue}"`
      });
      modified = true;
    }
  }

  if (modified) {
    // Apply replacements
    for (const {old, new: newValue} of replacements) {
      content = content.replace(old, newValue);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath} (${replacements.length} attributes)`);
    return replacements.length;
  }

  return 0;
}

// Process all discovery views
const files = glob.sync(discoveryViewsPattern, { cwd: __dirname });
let totalUpdated = 0;
let filesUpdated = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const count = addDataTestIdAttributes(fullPath);
  if (count > 0) {
    totalUpdated += count;
    filesUpdated++;
  }
});

console.log(`\n✅ Complete: ${filesUpdated} files updated, ${totalUpdated} attributes added`);
