/**
 * Identify Quick Win Test Fixes
 * Analyzes baseline-session-start.json to find patterns that can be bulk-fixed
 */

const fs = require('fs');

const baseline = JSON.parse(fs.readFileSync('./baseline-session-start.json', 'utf-8'));

const patterns = {
  'toBeInTheDocument-not-function': { count: 0, files: [], example: null },
  'data-cy-missing': { count: 0, files: [], example: null },
  'null-undefined-reading': { count: 0, files: [], example: null },
  'import-error': { count: 0, files: [], example: null },
  'timeout': { count: 0, files: [], example: null },
  'toBe-expected-received': { count: 0, files: [], example: null },
  'mock-implementation': { count: 0, files: [], example: null },
  'enzyme-vs-rtl': { count: 0, files: [], example: null },
  'other': { count: 0, files: [], example: null }
};

baseline.testResults.forEach(suite => {
  if (suite.status === 'failed' || suite.assertionResults?.some(t => t.status === 'failed')) {
    suite.assertionResults?.forEach(test => {
      if (test.status === 'failed') {
        const errors = test.failureMessages?.join('\n') || '';

        const filename = suite.name.replace(/\\/g, '/').split('/').pop();

        if (errors.includes('toBeInTheDocument is not a function') ||
            errors.includes('received.toBeInTheDocument is not a function')) {
          patterns['toBeInTheDocument-not-function'].count++;
          if (!patterns['toBeInTheDocument-not-function'].files.includes(filename)) {
            patterns['toBeInTheDocument-not-function'].files.push(filename);
          }
          if (!patterns['toBeInTheDocument-not-function'].example) {
            patterns['toBeInTheDocument-not-function'].example = {
              file: filename,
              test: test.title,
              error: errors.substring(0, 200)
            };
          }
        }
        else if (errors.includes('Unable to find an element with the') ||
                 errors.includes('[data-cy=')) {
          patterns['data-cy-missing'].count++;
          if (!patterns['data-cy-missing'].files.includes(filename)) {
            patterns['data-cy-missing'].files.push(filename);
          }
          if (!patterns['data-cy-missing'].example) {
            patterns['data-cy-missing'].example = {
              file: filename,
              test: test.title,
              error: errors.substring(0, 200)
            };
          }
        }
        else if (errors.includes('Cannot read propert') ||
                 errors.includes('of undefined') ||
                 errors.includes('of null')) {
          patterns['null-undefined-reading'].count++;
          if (!patterns['null-undefined-reading'].files.includes(filename)) {
            patterns['null-undefined-reading'].files.push(filename);
          }
          if (!patterns['null-undefined-reading'].example) {
            patterns['null-undefined-reading'].example = {
              file: filename,
              test: test.title,
              error: errors.substring(0, 300)
            };
          }
        }
        else if (errors.includes('Cannot find module') ||
                 errors.includes('MODULE_NOT_FOUND')) {
          patterns['import-error'].count++;
          if (!patterns['import-error'].files.includes(filename)) {
            patterns['import-error'].files.push(filename);
          }
          if (!patterns['import-error'].example) {
            patterns['import-error'].example = {
              file: filename,
              test: test.title,
              error: errors.substring(0, 200)
            };
          }
        }
        else if (errors.includes('Timeout') ||
                 errors.includes('exceeded') ||
                 errors.includes('timeout')) {
          patterns['timeout'].count++;
          if (!patterns['timeout'].files.includes(filename)) {
            patterns['timeout'].files.push(filename);
          }
          if (!patterns['timeout'].example) {
            patterns['timeout'].example = {
              file: filename,
              test: test.title,
              error: errors.substring(0, 200)
            };
          }
        }
        else if (errors.includes('Expected:') && errors.includes('Received:')) {
          patterns['toBe-expected-received'].count++;
          if (!patterns['toBe-expected-received'].files.includes(filename)) {
            patterns['toBe-expected-received'].files.push(filename);
          }
          if (!patterns['toBe-expected-received'].example) {
            patterns['toBe-expected-received'].example = {
              file: filename,
              test: test.title,
              error: errors.substring(0, 300)
            };
          }
        }
        else if (errors.includes('mockReturnValue') ||
                 errors.includes('mockResolvedValue') ||
                 errors.includes('mock')) {
          patterns['mock-implementation'].count++;
          if (!patterns['mock-implementation'].files.includes(filename)) {
            patterns['mock-implementation'].files.push(filename);
          }
          if (!patterns['mock-implementation'].example) {
            patterns['mock-implementation'].example = {
              file: filename,
              test: test.title,
              error: errors.substring(0, 200)
            };
          }
        }
        else if (errors.includes('shallow') ||
                 errors.includes('mount') ||
                 errors.includes('enzyme')) {
          patterns['enzyme-vs-rtl'].count++;
          if (!patterns['enzyme-vs-rtl'].files.includes(filename)) {
            patterns['enzyme-vs-rtl'].files.push(filename);
          }
          if (!patterns['enzyme-vs-rtl'].example) {
            patterns['enzyme-vs-rtl'].example = {
              file: filename,
              test: test.title,
              error: errors.substring(0, 200)
            };
          }
        }
        else {
          patterns['other'].count++;
          if (!patterns['other'].files.includes(filename)) {
            patterns['other'].files.push(filename);
          }
        }
      }
    });
  }
});

console.log('\n=== QUICK WIN OPPORTUNITIES ===\n');
console.log(`Total failed tests: ${baseline.numFailedTests}`);
console.log(`Total passing tests: ${baseline.numPassedTests}`);
console.log(`Total tests: ${baseline.numTotalTests}`);
console.log(`Current coverage: ${((baseline.numPassedTests / baseline.numTotalTests) * 100).toFixed(1)}%\n`);

// Sort by count
const sorted = Object.entries(patterns).sort((a, b) => b[1].count - a[1].count);

console.log('=== FAILURE PATTERNS (sorted by frequency) ===\n');

sorted.forEach(([pattern, data]) => {
  if (data.count > 0) {
    console.log(`${pattern}: ${data.count} failures across ${data.files.length} files`);
    if (data.example) {
      console.log(`  Example: ${data.example.file}`);
      console.log(`    Test: ${data.example.test}`);
      console.log(`    Error: ${data.example.error.replace(/\n/g, ' ').substring(0, 150)}...`);
    }
    console.log('');
  }
});

// Generate action plan
console.log('\n=== RECOMMENDED ACTION PLAN ===\n');

const actions = [];

if (patterns['toBeInTheDocument-not-function'].count > 5) {
  actions.push({
    priority: 1,
    pattern: 'toBeInTheDocument-not-function',
    count: patterns['toBeInTheDocument-not-function'].count,
    files: patterns['toBeInTheDocument-not-function'].files.length,
    action: 'Import @testing-library/jest-dom or use alternative matcher',
    effort: 'LOW',
    impact: patterns['toBeInTheDocument-not-function'].count
  });
}

if (patterns['data-cy-missing'].count > 10) {
  actions.push({
    priority: 2,
    pattern: 'data-cy-missing',
    count: patterns['data-cy-missing'].count,
    files: patterns['data-cy-missing'].files.length,
    action: 'Add data-cy attributes to components',
    effort: 'MEDIUM',
    impact: patterns['data-cy-missing'].count
  });
}

if (patterns['null-undefined-reading'].count > 10) {
  actions.push({
    priority: 3,
    pattern: 'null-undefined-reading',
    count: patterns['null-undefined-reading'].count,
    files: patterns['null-undefined-reading'].files.length,
    action: 'Add null safety checks (?. and ?? operators)',
    effort: 'MEDIUM',
    impact: patterns['null-undefined-reading'].count
  });
}

if (patterns['import-error'].count > 5) {
  actions.push({
    priority: 4,
    pattern: 'import-error',
    count: patterns['import-error'].count,
    files: patterns['import-error'].files.length,
    action: 'Fix module imports',
    effort: 'LOW',
    impact: patterns['import-error'].count
  });
}

if (patterns['timeout'].count > 5) {
  actions.push({
    priority: 5,
    pattern: 'timeout',
    count: patterns['timeout'].count,
    files: patterns['timeout'].files.length,
    action: 'Add proper async/await and waitFor patterns',
    effort: 'MEDIUM',
    impact: patterns['timeout'].count
  });
}

if (patterns['toBe-expected-received'].count > 20) {
  actions.push({
    priority: 6,
    pattern: 'toBe-expected-received',
    count: patterns['toBe-expected-received'].count,
    files: patterns['toBe-expected-received'].files.length,
    action: 'Fix assertion expectations (case-by-case analysis needed)',
    effort: 'HIGH',
    impact: patterns['toBe-expected-received'].count * 0.5 // Conservative - some may be real bugs
  });
}

actions.sort((a, b) => b.impact - a.impact);

actions.forEach((action, i) => {
  console.log(`${i + 1}. [${action.effort} EFFORT] ${action.pattern}`);
  console.log(`   Failures: ${action.count} across ${action.files} files`);
  console.log(`   Action: ${action.action}`);
  console.log(`   Estimated impact: +${Math.floor(action.impact)} tests`);
  console.log('');
});

// Write detailed output
fs.writeFileSync('./quick-wins.json', JSON.stringify({ patterns, actions }, null, 2));
console.log('✓ Detailed analysis written to quick-wins.json\n');
