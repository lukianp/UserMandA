#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Try to read the latest report file
let reportFile = 'jest-report-session-end.json';
if (!fs.existsSync(reportFile)) {
  reportFile = 'jest-report-final.json';
  if (!fs.existsSync(reportFile)) {
    reportFile = 'jest-report-progress.json';
  }
}
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
console.log(`\nReading from: ${reportFile}`);

console.log('\n=== TEST SUITE SUMMARY ===');
console.log(`Test Suites: ${report.numPassedTestSuites} passed, ${report.numFailedTestSuites} failed, ${report.numTotalTestSuites} total`);
console.log(`Tests: ${report.numPassedTests} passed, ${report.numFailedTests} failed, ${report.numPendingTests} skipped, ${report.numTotalTests} total`);
console.log(`Pass Rate: ${((report.numPassedTests / report.numTotalTests) * 100).toFixed(1)}%`);

// Debug
console.log(`\nTotal test results: ${report.testResults ? report.testResults.length : 'NO testResults'}`);

if (!report.testResults || report.testResults.length === 0) {
  console.log('\n❌ No testResults found in report');
  console.log('Report keys:', Object.keys(report).join(', '));
  process.exit(1);
}

// Calculate passing/failing counts from assertionResults
const analyzed = report.testResults.map(result => {
  const passing = result.assertionResults.filter(a => a.status === 'passed').length;
  const failing = result.assertionResults.filter(a => a.status === 'failed').length;
  const pending = result.assertionResults.filter(a => a.status === 'pending' || a.status === 'skipped').length;
  return {
    name: result.name,
    passing,
    failing,
    pending,
    total: result.assertionResults.length
  };
});

console.log('\n=== TOP 20 FAILING TEST SUITES ===');
const failing = analyzed
  .filter(r => r.failing > 0)
  .sort((a, b) => b.failing - a.failing)
  .slice(0, 20);

console.log(`Found ${failing.length} failing test suites\n`);

failing.forEach((result, i) => {
  const name = path.basename(result.name);
  console.log(`${String(i + 1).padStart(2)}. ${String(result.failing).padStart(2)} failures - ${name}`);
});

console.log('\n=== FULLY PASSING TEST SUITES (Recently Fixed) ===');
const passing = analyzed
  .filter(r => r.passing > 0 && r.failing === 0)
  .sort((a, b) => b.passing - a.passing)
  .slice(0, 10);

console.log(`Found ${passing.length} passing test suites\n`);

passing.forEach((result, i) => {
  const name = path.basename(result.name);
  console.log(`${String(i + 1).padStart(2)}. ${String(result.passing).padStart(2)} passing - ${name}`);
});
