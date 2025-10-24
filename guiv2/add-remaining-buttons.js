#!/usr/bin/env node
/**
 * Add data-cy to remaining discovery view buttons
 * Uses line-by-line parsing for better accuracy
 */

const fs = require('fs');
const path = require('path');

const files = [
  'ApplicationDiscoveryView.tsx',
  'AWSDiscoveryView.tsx',
  'WebServerConfigurationDiscoveryView.tsx',
];

const baseDir = 'src/renderer/views/discovery';

function addDataCyToLine(line, dataCyValue) {
  // Skip if already has data-cy
  if (line.includes('data-cy=')) {
    return line;
  }

  // For button/Button tags, add before the closing >
  if (/<(button|Button)\s/.test(line) && line.includes('>')) {
    // Find the last > in the line
    const lastBracket = line.lastIndexOf('>');
    return line.substring(0, lastBracket) + ` data-cy="${dataCyValue}"` + line.substring(lastBracket);
  }

  return line;
}

function addMissingDataCy(file) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${file}: Not found`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  const newLines = [];

  let inStartButton = false;
  let inExportButton = false;
  let inCancelButton = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Detect start of button blocks
    if (/<button|<Button/.test(line)) {
      // Look ahead for button text
      const nextFewLines = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');

      if (/Start\s+Discovery/i.test(nextFewLines) && !nextFewLines.includes('data-cy=')) {
        line = addDataCyToLine(line, 'start-discovery-btn');
        if (line !== lines[i]) {
          modified = true;
          console.log(`  ✓ Added start-discovery-btn at line ${i + 1}`);
        }
      } else if (/Export/i.test(nextFewLines) && !nextFewLines.includes('data-cy=')) {
        line = addDataCyToLine(line, 'export-results-btn');
        if (line !== lines[i]) {
          modified = true;
          console.log(`  ✓ Added export-results-btn at line ${i + 1}`);
        }
      } else if (/Cancel/i.test(nextFewLines) && !nextFewLines.includes('data-cy=')) {
        line = addDataCyToLine(line, 'cancel-discovery-btn');
        if (line !== lines[i]) {
          modified = true;
          console.log(`  ✓ Added cancel-discovery-btn at line ${i + 1}`);
        }
      }
    }

    newLines.push(line);
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`✅ ${file}: Modified`);
    return true;
  } else {
    console.log(`⚠️  ${file}: No modifications needed or unable to modify`);
    return false;
  }
}

console.log('Adding data-cy to remaining discovery view buttons...\n');

let count = 0;
for (const file of files) {
  console.log(`\nProcessing ${file}:`);
  if (addMissingDataCy(file)) {
    count++;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Modified ${count}/${files.length} files`);
