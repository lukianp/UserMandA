/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

// Read the baseline test results
const results = JSON.parse(fs.readFileSync('./baseline-comprehensive.json', 'utf8'));

// Categorize failures
const categories = {
  nullSafety: [],
  textMismatch: [],
  mockIssues: [],
  asyncTiming: [],
  syntaxErrors: [],
  missingElements: [],
  other: []
};

const categoryCounts = {
  nullSafety: 0,
  textMismatch: 0,
  mockIssues: 0,
  asyncTiming: 0,
  syntaxErrors: 0,
  missingElements: 0,
  other: 0
};

// Process each test suite
results.testResults.forEach(suite => {
  if (suite.status === 'failed') {
    suite.assertionResults.forEach(test => {
      if (test.status === 'failed') {
        const failureMessages = test.failureMessages.join('\n');
        const testInfo = {
          suite: suite.name,
          test: test.title,
          duration: test.duration,
          message: failureMessages.substring(0, 200)
        };

        // Categorize by error pattern
        if (failureMessages.includes('Cannot read propert') ||
            failureMessages.includes('Cannot access') ||
            failureMessages.includes('undefined')) {
          categories.nullSafety.push(testInfo);
          categoryCounts.nullSafety++;
        } else if (failureMessages.includes('Unable to find an element with the text') ||
                   failureMessages.includes('TestingLibraryElementError')) {
          categories.textMismatch.push(testInfo);
          categoryCounts.textMismatch++;
        } else if (failureMessages.includes('is not a function') ||
                   failureMessages.includes('mockReturnValue') ||
                   failureMessages.includes('toHaveBeenCalled')) {
          categories.mockIssues.push(testInfo);
          categoryCounts.mockIssues++;
        } else if (failureMessages.includes('Timeout') ||
                   failureMessages.includes('async') ||
                   failureMessages.includes('Promise')) {
          categories.asyncTiming.push(testInfo);
          categoryCounts.asyncTiming++;
        } else if (failureMessages.includes('Unexpected token') ||
                   failureMessages.includes('SyntaxError')) {
          categories.syntaxErrors.push(testInfo);
          categoryCounts.syntaxErrors++;
        } else if (failureMessages.includes('Unable to find element') ||
                   failureMessages.includes('data-cy') ||
                   failureMessages.includes('data-testid')) {
          categories.missingElements.push(testInfo);
          categoryCounts.missingElements++;
        } else {
          categories.other.push(testInfo);
          categoryCounts.other++;
        }
      }
    });
  }
});

// Generate report
console.log('=== TEST FAILURE ANALYSIS ===\n');
console.log(`Total Failures: ${results.numFailedTests}`);
console.log(`Total Passing: ${results.numPassedTests}`);
console.log(`Coverage: ${((results.numPassedTests / results.numTotalTests) * 100).toFixed(1)}%`);
console.log(`Target (95%): ${Math.ceil(results.numTotalTests * 0.95)}`);
console.log(`Gap: ${Math.ceil(results.numTotalTests * 0.95) - results.numPassedTests}\n`);

console.log('=== FAILURE CATEGORIES ===\n');
Object.entries(categoryCounts).forEach(([category, count]) => {
  const percentage = ((count / results.numFailedTests) * 100).toFixed(1);
  console.log(`${category.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)`);
});

console.log('\n=== TOP 10 FAILING SUITES ===\n');
const suiteCounts = {};
results.testResults.forEach(suite => {
  if (suite.status === 'failed') {
    const failedCount = suite.assertionResults.filter(t => t.status === 'failed').length;
    const suiteName = suite.name.replace(/^.*[\\/]/, '').replace('.test.tsx', '').replace('.test.ts', '');
    suiteCounts[suiteName] = (suiteCounts[suiteName] || 0) + failedCount;
  }
});

const topSuites = Object.entries(suiteCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

topSuites.forEach(([suite, count]) => {
  console.log(`${suite.padEnd(50)} ${count.toString().padStart(3)} failures`);
});

// Save detailed analysis
fs.writeFileSync('./failure-analysis-detailed.json', JSON.stringify(categories, null, 2));

console.log('\n=== DETAILED ANALYSIS SAVED ===');
console.log('File: failure-analysis-detailed.json');
console.log('\nCategories contain test paths and first 200 chars of each failure message.');
