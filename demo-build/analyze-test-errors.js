const fs = require('fs');

const reportFile = process.argv[2] || 'jest-report-current.json';
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));

const errorPatterns = {};
const suiteFailures = {};

report.testResults.forEach(suite => {
  if (suite.status === 'failed') {
    const suiteName = suite.name.split('\\').pop();
    suiteFailures[suiteName] = suiteFailures[suiteName] || { total: 0, patterns: {} };
    suiteFailures[suiteName].total += 1;

    suite.assertionResults.forEach(test => {
      if (test.status === 'failed' && test.failureMessages) {
        test.failureMessages.forEach(msg => {
          // Extract key error patterns
          if (msg.includes('Cannot find module')) {
            const match = msg.match(/Cannot find module '([^']+)'/);
            if (match) {
              const moduleName = match[1].split('/').pop();
              const key = `Missing module: ${moduleName}`;
              errorPatterns[key] = (errorPatterns[key] || 0) + 1;
              suiteFailures[suiteName].patterns[key] = true;
            }
          } else if (msg.includes('is not a function')) {
            const match = msg.match(/(\w+\.\w+) is not a function/);
            if (match) {
              const key = `Not a function: ${match[1]}`;
              errorPatterns[key] = (errorPatterns[key] || 0) + 1;
              suiteFailures[suiteName].patterns[key] = true;
            }
          } else if (msg.includes('Unable to find an element')) {
            const key = 'Missing UI element';
            errorPatterns[key] = (errorPatterns[key] || 0) + 1;
          } else if (msg.includes('toBeTruthy') && msg.includes('null')) {
            const key = 'Null value (toBeTruthy)';
            errorPatterns[key] = (errorPatterns[key] || 0) + 1;
          } else if (msg.includes('Element type is invalid')) {
            const key = 'Invalid element type';
            errorPatterns[key] = (errorPatterns[key] || 0) + 1;
          }
        });
      }
    });
  }
});

const sorted = Object.entries(errorPatterns).sort((a,b) => b[1] - a[1]);

console.log('='.repeat(80));
console.log('TOP ERROR PATTERNS');
console.log('='.repeat(80));
console.log('');
sorted.slice(0, 15).forEach(([pattern, count]) => {
  console.log(`  ${count.toString().padStart(4)} - ${pattern}`);
});

console.log('');
console.log('='.repeat(80));
console.log('SUITES WITH MOST FAILURES');
console.log('='.repeat(80));
console.log('');
const sortedSuites = Object.entries(suiteFailures)
  .sort((a,b) => b[1].total - a[1].total)
  .slice(0, 10);

sortedSuites.forEach(([suite, info]) => {
  console.log(`\n${suite}:`);
  Object.keys(info.patterns).forEach(pattern => {
    console.log(`  - ${pattern}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log(`Total test suites: ${report.numTotalTestSuites}`);
console.log(`Failed suites: ${report.numFailedTestSuites}`);
console.log(`Passing suites: ${report.numPassedTestSuites}`);
console.log(`Total tests: ${report.numTotalTests}`);
console.log(`Failed tests: ${report.numFailedTests}`);
console.log(`Passing tests: ${report.numPassedTests}`);
console.log('='.repeat(80));
