#!/usr/bin/env node
/**
 * Compare test results between phases
 */

const fs = require('fs');

function loadResults(filename) {
  if (!fs.existsSync(filename)) {
    return null;
  }
  const content = fs.readFileSync(filename, 'utf8');
  return JSON.parse(content);
}

function analyzeResults(results, phaseName) {
  if (!results) {
    console.log(`❌ ${phaseName}: No results found`);
    return null;
  }

  const { numTotalTests, numPassedTests, numFailedTests, numPendingTests } = results;
  const passRate = ((numPassedTests / numTotalTests) * 100).toFixed(1);

  return {
    phase: phaseName,
    total: numTotalTests,
    passed: numPassedTests,
    failed: numFailedTests,
    pending: numPendingTests,
    passRate: parseFloat(passRate),
  };
}

// Load all available phase results
const phases = [
  { file: 'jest-phase4-results.json', name: 'Phase 4 (Baseline)' },
  { file: 'jest-phase5-checkpoint1.json', name: 'Phase 5 Checkpoint 1' },
  { file: 'jest-phase5-complete.json', name: 'Phase 5 Complete' },
];

console.log('=' .repeat(70));
console.log('TEST COVERAGE COMPARISON REPORT');
console.log('='.repeat(70));
console.log('');

const results = [];

for (const { file, name } of phases) {
  const data = loadResults(file);
  const analysis = analyzeResults(data, name);
  if (analysis) {
    results.push(analysis);
  }
}

if (results.length === 0) {
  console.log('No results found to compare.');
  process.exit(1);
}

// Display results table
console.log('PHASE RESULTS:');
console.log('-'.repeat(70));
console.log(
  'Phase'.padEnd(25) +
    'Total'.padEnd(10) +
    'Passed'.padEnd(10) +
    'Failed'.padEnd(10) +
    'Pass Rate'
);
console.log('-'.repeat(70));

for (const result of results) {
  console.log(
    result.phase.padEnd(25) +
      result.total.toString().padEnd(10) +
      result.passed.toString().padEnd(10) +
      result.failed.toString().padEnd(10) +
      `${result.passRate}%`
  );
}

// Calculate improvements
if (results.length >= 2) {
  console.log('');
  console.log('='.repeat(70));
  console.log('IMPROVEMENTS:');
  console.log('='.repeat(70));

  for (let i = 1; i < results.length; i++) {
    const prev = results[i - 1];
    const curr = results[i];

    const testDiff = curr.passed - prev.passed;
    const rateDiff = (curr.passRate - prev.passRate).toFixed(1);
    const percentOfGoal = ((curr.passed / 2937) * 100).toFixed(1);

    console.log('');
    console.log(`${curr.phase} vs ${prev.phase}:`);
    console.log(`  Tests improved: ${testDiff >= 0 ? '+' : ''}${testDiff}`);
    console.log(`  Pass rate change: ${rateDiff >= 0 ? '+' : ''}${rateDiff}%`);
    console.log(`  Progress to 95% goal: ${percentOfGoal}% (${curr.passed}/2937)`);

    if (testDiff > 0) {
      const remaining = 2937 - curr.passed;
      const phasesNeeded = Math.ceil(remaining / testDiff);
      console.log(`  Estimated phases to 95% at this rate: ${phasesNeeded}`);
    }
  }
}

// Target analysis
if (results.length > 0) {
  const latest = results[results.length - 1];
  const target = 2937; // 95% of 3,136 tests (estimated)
  const remaining = target - latest.passed;
  const currentProgress = ((latest.passed / target) * 100).toFixed(1);

  console.log('');
  console.log('='.repeat(70));
  console.log('TARGET ANALYSIS (95% Goal):');
  console.log('='.repeat(70));
  console.log(`Current: ${latest.passed} tests passing (${currentProgress}% of goal)`);
  console.log(`Target: ${target} tests passing`);
  console.log(`Remaining: ${remaining} tests`);
  console.log(`Gap: ${((remaining / target) * 100).toFixed(1)}% of goal`);
}

console.log('');
console.log('='.repeat(70));
