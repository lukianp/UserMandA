/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const report = JSON.parse(fs.readFileSync('jest-report-current.json', 'utf-8'));

// Count failures by error pattern
const errorPatterns = {};
let totalFailures = 0;

report.testResults.forEach(suite => {
  if (suite.status === 'failed') {
    suite.assertionResults.forEach(test => {
      if (test.status === 'failed') {
        totalFailures++;
        const msg = test.failureMessages[0] || '';

        // Classify errors
        if (msg.includes('Cannot read properties of undefined') || msg.includes('Cannot read property')) {
          errorPatterns['Null/Undefined Property Access'] = (errorPatterns['Null/Undefined Property Access'] || 0) + 1;
        } else if (msg.includes('Element type is invalid')) {
          errorPatterns['Invalid Element Type'] = (errorPatterns['Invalid Element Type'] || 0) + 1;
        } else if (msg.includes('Unable to find') || msg.includes('TestingLibraryElementError')) {
          errorPatterns['Element Not Found'] = (errorPatterns['Element Not Found'] || 0) + 1;
        } else if (msg.includes('Timeout') || msg.includes('exceeded')) {
          errorPatterns['Timeout'] = (errorPatterns['Timeout'] || 0) + 1;
        } else if (msg.includes('Module not found') || msg.includes('Cannot find module')) {
          errorPatterns['Module Not Found'] = (errorPatterns['Module Not Found'] || 0) + 1;
        } else {
          errorPatterns['Other'] = (errorPatterns['Other'] || 0) + 1;
        }
      }
    });
  }
});

console.log('\n=== Test Results Summary ===');
console.log(`Total Tests: ${report.numTotalTests}`);
console.log(`Passed: ${report.numPassedTests} (${((report.numPassedTests / report.numTotalTests) * 100).toFixed(1)}%)`);
console.log(`Failed: ${report.numFailedTests}`);
console.log(`Skipped: ${report.numPendingTests}`);

console.log('\n=== Error Pattern Analysis ===');
Object.entries(errorPatterns)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pattern, count]) => {
    const pct = ((count / totalFailures) * 100).toFixed(1);
    console.log(`${pattern}: ${count} (${pct}%)`);
  });

console.log('\n=== Passing Service Tests ===');
const servicePaths = report.testResults.filter(s => s.name.includes('/services/') && s.status === 'passed');
servicePaths.forEach(s => {
  const name = s.name.split(/[/\\]/).pop().replace('.test.ts', '');
  const passed = s.assertionResults.filter(t => t.status === 'passed').length;
  console.log(`✓ ${name}: ${passed} tests`);
});

console.log('\n=== Failing Test Suites (Top 10) ===');
const failingSuites = report.testResults
  .filter(s => s.status === 'failed')
  .map(s => ({
    name: s.name.split(/[/\\]/).pop(),
    failed: s.assertionResults.filter(t => t.status === 'failed').length,
    passed: s.assertionResults.filter(t => t.status === 'passed').length,
  }))
  .sort((a, b) => b.failed - a.failed)
  .slice(0, 10);

failingSuites.forEach(s => {
  console.log(`✗ ${s.name}: ${s.failed} failed, ${s.passed} passed`);
});
