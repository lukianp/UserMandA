#!/usr/bin/env node
/**
 * Analyze test files to extract missing data-cy attributes with context
 * This provides actionable data for bulk fixes
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');

// Find all test files
const testFiles = glob.sync('src/**/*.test.{ts,tsx}');

console.log(`Analyzing ${testFiles.length} test files...\n`);

// Extract data-cy queries from test files
const dataCyQueries = new Map(); // attribute -> [{file, line, context}]

for (const testFile of testFiles) {
  const content = fs.readFileSync(testFile, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Look for getByTestId, findByTestId, queryByTestId patterns
    const patterns = [
      /getByTestId\(['"]([^'"]+)['"]\)/g,
      /findByTestId\(['"]([^'"]+)['"]\)/g,
      /queryByTestId\(['"]([^'"]+)['"]\)/g,
      /getAllByTestId\(['"]([^'"]+)['"]\)/g,
      /findAllByTestId\(['"]([^'"]+)['"]\)/g,
      /\[data-cy=['"]([^'"]+)['"]\]/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const attribute = match[1];
        if (!dataCyQueries.has(attribute)) {
          dataCyQueries.set(attribute, []);
        }
        dataCyQueries.get(attribute).push({
          file: testFile,
          line: index + 1,
          context: line.trim(),
        });
      }
    }
  });
}

// Sort by frequency
const sortedQueries = Array.from(dataCyQueries.entries())
  .map(([attribute, occurrences]) => ({
    attribute,
    count: occurrences.length,
    occurrences,
  }))
  .sort((a, b) => b.count - a.count);

console.log(`Found ${sortedQueries.length} unique data-cy attributes queried in tests\n`);
console.log('Top 50 most queried attributes:\n');

// Output results
const output = [];
output.push('# Data-cy Attribute Analysis');
output.push(`Generated: ${new Date().toISOString()}`);
output.push(`Total unique attributes: ${sortedQueries.length}`);
output.push('');

for (const { attribute, count, occurrences } of sortedQueries.slice(0, 50)) {
  console.log(`${count.toString().padStart(4)}x  ${attribute}`);

  output.push(`## ${attribute} (${count} occurrences)`);

  // Find the corresponding component file
  const viewFiles = occurrences
    .map(o => o.file.replace('.test.tsx', '.tsx').replace('.test.ts', '.ts'))
    .filter((v, i, a) => a.indexOf(v) === i);

  output.push(`Component files: ${viewFiles.map(f => path.basename(f)).join(', ')}`);

  // Show a sample context
  if (occurrences.length > 0) {
    output.push(`Example: ${occurrences[0].context.substring(0, 100)}`);
  }

  output.push('');
}

// Save to file
fs.writeFileSync('data-cy-analysis.md', output.join('\n'), 'utf8');
console.log('\n✓ Analysis saved to data-cy-analysis.md');

// Generate actionable fix list
const fixList = sortedQueries.slice(0, 50).map(({ attribute, occurrences }) => {
  // Infer component file from test file
  const testFile = occurrences[0].file;
  const componentFile = testFile.replace('.test.tsx', '.tsx').replace('.test.ts', '.ts');

  return {
    attribute,
    count: occurrences.length,
    componentFile,
    exists: fs.existsSync(componentFile),
  };
});

// Save actionable fix list
fs.writeFileSync(
  'data-cy-fix-list.json',
  JSON.stringify(fixList, null, 2),
  'utf8'
);
console.log('✓ Fix list saved to data-cy-fix-list.json');

// Stats
const existingFiles = fixList.filter(f => f.exists).length;
console.log(`\n${existingFiles}/${fixList.length} component files exist and can be modified`);
