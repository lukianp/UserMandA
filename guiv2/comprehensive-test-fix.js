/**
 * Comprehensive Test Fix Script
 * Systematically fixes test failures across the codebase
 */

const fs = require('fs');
const path = require('path');
const testResults = require('./jest-batch-start.json');

// Parse failures by type
const failures = {
  nullSafety: [],
  asyncTiming: [],
  mockIssues: [],
  componentErrors: [],
  other: []
};

// Categorize failures
testResults.testResults.forEach(suite => {
  if (suite.status === 'failed') {
    suite.assertionResults.forEach(test => {
      if (test.status === 'failed') {
        const failure = {
          file: suite.name,
          testName: test.fullName,
          message: test.failureMessages?.join('\n') || ''
        };

        if (failure.message.includes('Cannot read properties of undefined') ||
            failure.message.includes('Cannot read property') ||
            failure.message.includes('undefined is not an object')) {
          failures.nullSafety.push(failure);
        } else if (failure.message.includes('Timeout') ||
                   failure.message.includes('async') ||
                   failure.message.includes('waitFor')) {
          failures.asyncTiming.push(failure);
        } else if (failure.message.includes('mock') ||
                   failure.message.includes('spy')) {
          failures.mockIssues.push(failure);
        } else if (failure.message.includes('Component') ||
                   failure.message.includes('render')) {
          failures.componentErrors.push(failure);
        } else {
          failures.other.push(failure);
        }
      }
    });
  }
});

// Generate report
console.log('\n=== COMPREHENSIVE TEST FAILURE ANALYSIS ===\n');
console.log(`Total Tests: ${testResults.numTotalTests}`);
console.log(`Passed: ${testResults.numPassedTests} (${(testResults.numPassedTests/testResults.numTotalTests*100).toFixed(1)}%)`);
console.log(`Failed: ${testResults.numFailedTests}`);
console.log(`Skipped: ${testResults.numPendingTests}`);
console.log(`\nTarget: 2,937 tests (95%)`);
console.log(`Gap: ${2937 - testResults.numPassedTests} tests\n`);

console.log('=== FAILURE BREAKDOWN BY CATEGORY ===\n');
console.log(`Null Safety Issues: ${failures.nullSafety.length}`);
console.log(`Async/Timing Issues: ${failures.asyncTiming.length}`);
console.log(`Mock Issues: ${failures.mockIssues.length}`);
console.log(`Component Errors: ${failures.componentErrors.length}`);
console.log(`Other: ${failures.other.length}\n`);

// Find high-impact files (files with multiple failures)
const fileFailureCounts = {};
testResults.testResults.forEach(suite => {
  if (suite.status === 'failed') {
    const failedCount = suite.assertionResults.filter(t => t.status === 'failed').length;
    if (failedCount > 0) {
      const relativePath = suite.name.replace(/.*guiv2[\\\/]/, '');
      fileFailureCounts[relativePath] = failedCount;
    }
  }
});

// Sort by failure count
const sortedFiles = Object.entries(fileFailureCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

console.log('=== TOP 20 FILES BY FAILURE COUNT ===\n');
sortedFiles.forEach(([file, count], index) => {
  console.log(`${index + 1}. ${file}: ${count} failures`);
});

// Find files with only 1-5 failures (quick wins)
const quickWins = Object.entries(fileFailureCounts)
  .filter(([file, count]) => count >= 1 && count <= 5)
  .sort((a, b) => a[1] - b[1]);

console.log(`\n=== QUICK WIN OPPORTUNITIES (${quickWins.length} files with 1-5 failures) ===\n`);
quickWins.slice(0, 30).forEach(([file, count]) => {
  console.log(`${file}: ${count} failure(s)`);
});

// Generate fix recommendations
console.log('\n=== FIX RECOMMENDATIONS ===\n');

console.log('1. HIGH-IMPACT FIXES (Top 10 files):');
sortedFiles.slice(0, 10).forEach(([file, count]) => {
  console.log(`   - ${file} (${count} tests)`);
});

console.log('\n2. NULL SAFETY FIXES (Sample):');
failures.nullSafety.slice(0, 5).forEach(f => {
  const file = f.file.replace(/.*guiv2[\\\/]/, '');
  console.log(`   - ${file}`);
  console.log(`     Test: ${f.testName}`);
  console.log(`     Issue: ${f.message.split('\n')[0]}\n`);
});

console.log('3. ASYNC TIMING FIXES (Sample):');
failures.asyncTiming.slice(0, 5).forEach(f => {
  const file = f.file.replace(/.*guiv2[\\\/]/, '');
  console.log(`   - ${file}`);
  console.log(`     Test: ${f.testName}\n`);
});

// Save detailed report
const report = {
  summary: {
    total: testResults.numTotalTests,
    passed: testResults.numPassedTests,
    failed: testResults.numFailedTests,
    skipped: testResults.numPendingTests,
    target: 2937,
    gap: 2937 - testResults.numPassedTests
  },
  failuresByCategory: {
    nullSafety: failures.nullSafety.length,
    asyncTiming: failures.asyncTiming.length,
    mockIssues: failures.mockIssues.length,
    componentErrors: failures.componentErrors.length,
    other: failures.other.length
  },
  topFiles: sortedFiles,
  quickWins: quickWins,
  detailedFailures: failures
};

fs.writeFileSync('test-failure-analysis.json', JSON.stringify(report, null, 2));
console.log('\nDetailed analysis saved to: test-failure-analysis.json\n');
