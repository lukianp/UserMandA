/**
 * Identify Specific Null Safety Targets from Test Failures
 * Only fix files that have ACTUAL null safety test failures
 */

const results = require('./jest-batch-2-reverted.json');

const nullSafetyFailures = {};

results.testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    if (test.status === 'failed' && test.failureMessages) {
      const msg = test.failureMessages[0];

      // Look for null safety issues
      const undefinedMatch = msg.match(/Cannot read properties of undefined \(reading '([^']+)'\)/);
      if (undefinedMatch) {
        const property = undefinedMatch[1];

        // Extract file from error stack
        const fileMatch = msg.match(/at .*?\(([^)]+\.tsx?):(\d+):\d+\)/);
        if (fileMatch) {
          const file = fileMatch[1];
          const line = parseInt(fileMatch[2]);

          // Skip test files and node_modules
          if (!file.includes('.test.') && !file.includes('node_modules')) {
            if (!nullSafetyFailures[file]) {
              nullSafetyFailures[file] = [];
            }
            nullSafetyFailures[file].push({
              property,
              line,
              test: test.title,
              suite: suite.name
            });
          }
        }
      }
    }
  });
});

// Group by property type
const byProperty = {};
Object.entries(nullSafetyFailures).forEach(([file, failures]) => {
  if (Array.isArray(failures)) {
    failures.forEach(f => {
      if (!Array.isArray(byProperty[f.property])) {
        byProperty[f.property] = [];
      }
      byProperty[f.property].push({ file, line: f.line });
    });
  }
});

console.log('=== NULL SAFETY TARGETS ===\n');
console.log(`Total files with null safety issues: ${Object.keys(nullSafetyFailures).length}\n`);

console.log('BY PROPERTY:');
Object.entries(byProperty)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([prop, occurrences]) => {
    console.log(`\n${prop} (${occurrences.length} occurrences):`);
    occurrences.slice(0, 5).forEach(o => {
      const shortPath = o.file.replace(/.*[\\\/]guiv2[\\\/]/, '');
      console.log(`  ${shortPath}:${o.line}`);
    });
    if (occurrences.length > 5) {
      console.log(`  ... and ${occurrences.length - 5} more`);
    }
  });

console.log('\n\nBY FILE (Top 20):');
Object.entries(nullSafetyFailures)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20)
  .forEach(([file, failures]) => {
    const shortPath = file.replace(/.*[\\\/]guiv2[\\\/]/, '');
    const props = [...new Set(failures.map(f => f.property))].join(', ');
    console.log(`${shortPath} - ${failures.length} issues (${props})`);
  });

// Generate targeted fix list
const fs = require('fs');
const targetFiles = Object.keys(nullSafetyFailures).map(f => f.replace(/.*[\\\/]guiv2[\\\/]/, ''));
fs.writeFileSync('./null-safety-targets.json', JSON.stringify({
  files: targetFiles,
  details: nullSafetyFailures,
  summary: {
    totalFiles: targetFiles.length,
    byProperty
  }
}, null, 2));

console.log('\n\n✅ Detailed analysis saved to: null-safety-targets.json');
