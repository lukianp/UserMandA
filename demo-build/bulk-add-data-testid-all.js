#!/usr/bin/env node
/**
 * Bulk add data-testid to ALL views where data-cy exists
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const viewsPattern = 'src/renderer/views/**/*.tsx';

function addDataTestIdAttributes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern: data-cy="X" but missing data-testid="X"
  // Match data-cy with proper boundaries
  const dataCyPattern = /data-cy="([^"]+)"/g;

  const replacements = [];
  let match;

  // Reset regex index
  dataCyPattern.lastIndex = 0;

  while ((match = dataCyPattern.exec(content)) !== null) {
    const dataCyValue = match[1];
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    // Find the element boundaries (previous < and next >)
    let elementStart = matchStart;
    while (elementStart > 0 && content[elementStart] !== '<') {
      elementStart--;
    }

    let elementEnd = matchEnd;
    while (elementEnd < content.length && content[elementEnd] !== '>') {
      elementEnd++;
    }

    const elementContent = content.substring(elementStart, elementEnd + 1);

    // Check if data-testid already exists in this element
    if (!elementContent.includes(`data-testid="${dataCyValue}"`)) {
      replacements.push({
        index: matchEnd,
        value: ` data-testid="${dataCyValue}"`
      });
      modified = true;
    }
  }

  if (modified) {
    // Apply replacements from end to start to maintain indices
    replacements.sort((a, b) => b.index - a.index);

    for (const {index, value} of replacements) {
      content = content.substring(0, index) + value + content.substring(index);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${path.relative(__dirname, filePath)} (${replacements.length} attributes)`);
    return replacements.length;
  }

  return 0;
}

// Process all views
const files = glob.sync(viewsPattern, { cwd: __dirname });
let totalUpdated = 0;
let filesUpdated = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const count = addDataTestIdAttributes(fullPath);
    if (count > 0) {
      totalUpdated += count;
      filesUpdated++;
    }
  }
});

console.log(`\n✅ Complete: ${filesUpdated} files updated, ${totalUpdated} attributes added`);
