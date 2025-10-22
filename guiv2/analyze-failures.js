const fs = require('fs');
const report = JSON.parse(fs.readFileSync('./current-test-report.json', 'utf-8'));
const errorCategories = {
  missingDataCy: [],
  nullUndefined: [],
  mockErrors: [],
  timeouts: [],
  other: []
};
report.testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    if (test.status === 'failed') {
      const msg = test.failureMessages.join('\n');
      const testInfo = suite.name + '::' + test.title;
      if (msg.includes('Unable to find an element') || msg.includes('TestingLibraryElementError')) {
        errorCategories.missingDataCy.push(testInfo);
      } else if (msg.includes('Cannot read propert') || msg.includes('undefined') || msg.includes('TypeError')) {
        errorCategories.nullUndefined.push(testInfo);
      } else if (msg.includes('is not a function') || msg.includes('mockResolvedValue') || msg.includes('mock')) {
        errorCategories.mockErrors.push(testInfo);
      } else if (msg.includes('Exceeded timeout') || msg.includes('timeout')) {
        errorCategories.timeouts.push(testInfo);
      } else {
        errorCategories.other.push(testInfo);
      }
    }
  });
});
console.log('=== FAILURE ANALYSIS ===');
console.log('Missing data-cy attributes: ' + errorCategories.missingDataCy.length);
console.log('Null/undefined errors: ' + errorCategories.nullUndefined.length);
console.log('Mock errors: ' + errorCategories.mockErrors.length);
console.log('Timeout errors: ' + errorCategories.timeouts.length);
console.log('Other errors: ' + errorCategories.other.length);
console.log('Total failures: ' + report.numFailedTests);
console.log('Pass rate: ' + ((report.numPassedTests / report.numTotalTests) * 100).toFixed(1) + '%');
fs.writeFileSync('failure-categories.json', JSON.stringify(errorCategories, null, 2));
console.log('Detailed categories written to failure-categories.json');
