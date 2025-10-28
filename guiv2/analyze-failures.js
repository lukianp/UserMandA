const fs = require('fs');

const results = JSON.parse(fs.readFileSync('test-results-baseline.json', 'utf-8'));

const failedTests = results.testResults.filter(r => r.status === 'failed');
const errorPatterns = {};
const fileErrorCounts = {};

failedTests.forEach(suite => {
  const fileName = suite.name.replace(/.*\/src\//, 'src/');
  const failed = suite.assertionResults.filter(t => t.status === 'failed');

  if (failed.length > 0) {
    fileErrorCounts[fileName] = failed.length;
  }

  failed.forEach(test => {
    test.failureMessages.forEach(msg => {
      if (msg.includes('toBeInTheDocument')) {
        errorPatterns['toBeInTheDocument missing'] = (errorPatterns['toBeInTheDocument missing'] || 0) + 1;
      } else if (msg.includes('Unable to find an element')) {
        errorPatterns['Element not found'] = (errorPatterns['Element not found'] || 0) + 1;
      } else if (msg.includes('Cannot read properties of undefined')) {
        errorPatterns['Undefined property'] = (errorPatterns['Undefined property'] || 0) + 1;
      } else if (msg.includes('TypeError')) {
        errorPatterns['TypeError'] = (errorPatterns['TypeError'] || 0) + 1;
      } else if (msg.includes('Expected:') && msg.includes('Received:')) {
        errorPatterns['Value mismatch'] = (errorPatterns['Value mismatch'] || 0) + 1;
      } else {
        errorPatterns['Other'] = (errorPatterns['Other'] || 0) + 1;
      }
    });
  });
});

console.log('\n=== ERROR PATTERNS ===');
Object.entries(errorPatterns)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pattern, count]) => {
    console.log(pattern + ': ' + count);
  });

console.log('\n=== TOP 20 FILES WITH MOST FAILURES ===');
Object.entries(fileErrorCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([file, count]) => {
    console.log(count + ' failures: ' + file);
  });

console.log('\n=== SUMMARY ===');
console.log('Total failed tests: ' + results.numFailedTests);
console.log('Total passing tests: ' + results.numPassedTests);
console.log('Total tests: ' + results.numTotalTests);
console.log('Coverage: ' + (results.numPassedTests / results.numTotalTests * 100).toFixed(2) + '%');
