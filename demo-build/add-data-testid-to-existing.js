/**
 * Add data-testid to elements that already have data-cy
 */

const fs = require('fs');
const path = require('path');

function addDataTestId(content, filePath) {
  let modified = content;
  let changeCount = 0;

  // Pattern: Find any element with data-cy but not data-testid
  const dataCyPattern = /(\s+data-cy="([^"]+)")(?!\s+data-testid=)([^>]*>)/g;

  modified = modified.replace(dataCyPattern, (match, dataCy, cyValue, after) => {
    changeCount++;
    console.log(`  [+] Added data-testid="${cyValue}" (had data-cy) in ${path.basename(filePath)}`);
    return `${dataCy} data-testid="${cyValue}"${after}`;
  });

  return { modified, changeCount };
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const result = addDataTestId(content, filePath);

  if (result.changeCount > 0) {
    fs.writeFileSync(filePath, result.modified, 'utf8');
    console.log(`  ✓ Added ${result.changeCount} data-testid attributes to ${path.basename(filePath)}\n`);
    return result.changeCount;
  }
  return 0;
}

function main() {
  const discoveryViewsPath = path.join(__dirname, 'src', 'renderer', 'views', 'discovery');

  console.log('=== Adding data-testid to elements with data-cy ===\n');

  const files = fs.readdirSync(discoveryViewsPath)
    .filter(f => f.endsWith('View.tsx') && !f.includes('.test.'))
    .map(f => path.join(discoveryViewsPath, f));

  let totalChanges = 0;

  files.forEach(file => {
    const changes = processFile(file);
    totalChanges += changes;
  });

  console.log(`\n=== Summary ===`);
  console.log(`Total data-testid attributes added: ${totalChanges}`);
}

main();
