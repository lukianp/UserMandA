const fs = require('fs');

const glob = require('glob');

// Common patterns for data-cy mismatches
const fixes = [
  // Cancel button naming
  { from: 'data-cy="cancel-btn"', to: 'data-cy="cancel-discovery-btn"', count: 0 },
  { from: 'data-cy="stop-btn"', to: 'data-cy="cancel-discovery-btn"', count: 0 },
  { from: 'data-testid="cancel-btn"', to: 'data-testid="cancel-discovery-btn"', count: 0 },
  { from: 'data-testid="stop-btn"', to: 'data-testid="cancel-discovery-btn"', count: 0 },
  // Export button naming
  { from: 'data-cy="export-btn"', to: 'data-cy="export-results-btn"', count: 0 },
  { from: 'data-testid="export-btn"', to: 'data-testid="export-results-btn"', count: 0 },
  // Start button naming
  { from: 'data-cy="start-btn"', to: 'data-cy="start-discovery-btn"', count: 0 },
  { from: 'data-cy="run-discovery-btn"', to: 'data-cy="start-discovery-btn"', count: 0 },
  { from: 'data-testid="start-btn"', to: 'data-testid="start-discovery-btn"', count: 0 },
  { from: 'data-testid="run-discovery-btn"', to: 'data-testid="start-discovery-btn"', count: 0 },
];

// Find all discovery view files
const viewFiles = glob.sync('src/renderer/views/**/*View.tsx');

let totalFixes = 0;
let filesModified = 0;

viewFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  fixes.forEach(fix => {
    const count = (content.match(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count > 0) {
      content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
      fix.count += count;
      totalFixes += count;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    filesModified++;
  }
});

console.log(`Fixed ${totalFixes} data-cy/data-testid attributes across ${filesModified} files`);
fixes.forEach(fix => {
  if (fix.count > 0) {
    console.log(`  ${fix.from} -> ${fix.to}: ${fix.count} replacements`);
  }
});
