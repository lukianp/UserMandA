#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'current-test-report.json');

if (!fs.existsSync(reportPath)) {
  console.error('Report file not found:', reportPath);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

console.log('='.repeat(80));
console.log('TEST FAILURE ANALYSIS');
console.log('='.repeat(80));
console.log();

console.log('OVERALL SUMMARY:');
console.log(\`  Total Suites: \${report.numTotalTestSuites}\`);
console.log(\`  Failed Suites: \${report.numFailedTestSuites}\`);
console.log(\`  Passed Suites: \${report.numPassedTestSuites}\`);
console.log(\`  Total Tests: \${report.numTotalTests}\`);
console.log(\`  Failed Tests: \${report.numFailedTests}\`);
console.log(\`  Passed Tests: \${report.numPassedTests}\`);
console.log(\`  Pass Rate: \${((report.numPassedTests / report.numTotalTests) * 100).toFixed(1)}%\`);
console.log();

// Analyze failure patterns
const errorPatterns = {};
const failedSuites = [];

if (report.testResults) {
  report.testResults.forEach(suite => {
    if (suite.status === 'failed') {
      const suiteName = suite.name.replace(/^.*[\\/]src[\\/]/, 'src/');
      failedSuites.push(suiteName);

      if (suite.assertionResults) {
        suite.assertionResults.forEach(test => {
          if (test.status === 'failed' && test.failureMessages) {
            test.failureMessages.forEach(msg => {
              // Extract error patterns
              if (msg.includes('Unable to find an element')) {
                errorPatterns['Missing data-cy attributes'] = (errorPatterns['Missing data-cy attributes'] || 0) + 1;
              } else if (msg.includes('Cannot read propert')) {
                errorPatterns['Null/undefined property access'] = (errorPatterns['Null/undefined property access'] || 0) + 1;
              } else if (msg.includes('TypeError')) {
                errorPatterns['TypeError'] = (errorPatterns['TypeError'] || 0) + 1;
              } else if (msg.includes('is not a function')) {
                errorPatterns['Function not defined'] = (errorPatterns['Function not defined'] || 0) + 1;
              } else if (msg.includes('Exceeded timeout')) {
                errorPatterns['Timeout'] = (errorPatterns['Timeout'] || 0) + 1;
              } else if (msg.includes('ReferenceError')) {
                errorPatterns['ReferenceError'] = (errorPatterns['ReferenceError'] || 0) + 1;
              } else {
                errorPatterns['Other'] = (errorPatterns['Other'] || 0) + 1;
              }
            });
          }
        });
      }
    }
  });
}

console.log('ERROR PATTERNS:');
const sortedPatterns = Object.entries(errorPatterns).sort((a, b) => b[1] - a[1]);
sortedPatterns.forEach(([pattern, count]) => {
  console.log(\`  \${pattern}: \${count}\`);
});
console.log();

console.log(\`FAILED SUITES (\${failedSuites.length}):\`);
failedSuites.slice(0, 20).forEach(suite => {
  console.log(\`  - \${suite}\`);
});
if (failedSuites.length > 20) {
  console.log(\`  ... and \${failedSuites.length - 20} more\`);
}

const detailedReport = {
  summary: {
    totalSuites: report.numTotalTestSuites,
    failedSuites: report.numFailedTestSuites,
    passedSuites: report.numPassedTestSuites,
    totalTests: report.numTotalTests,
    failedTests: report.numFailedTests,
    passedTests: report.numPassedTests,
    passRate: ((report.numPassedTests / report.numTotalTests) * 100).toFixed(1) + '%'
  },
  errorPatterns,
  failedSuites
};

fs.writeFileSync(
  path.join(__dirname, 'failure-analysis.json'),
  JSON.stringify(detailedReport, null, 2)
);

console.log('Detailed analysis saved to failure-analysis.json');
