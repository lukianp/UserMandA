const fs = require('fs');

// Load all analysis data
const failureAnalysis = JSON.parse(fs.readFileSync('failure-analysis-comprehensive.json', 'utf8'));
const failureCategories = JSON.parse(fs.readFileSync('failure-categories-detailed.json', 'utf8'));
const pendingAnalysis = JSON.parse(fs.readFileSync('pending-tests-analysis.json', 'utf8'));

// Define patterns with effort estimates
const patterns = [
  {
    pattern: 'Missing data-testid Attributes',
    count: failureCategories.missingDataTestId.length,
    description: 'Tests looking for data-testid attributes that don\'t exist in components',
    effort: 1.5, // hours
    effortPer: 0.05, // hours per fix
    approach: 'Add missing data-testid attributes to components or update tests to use existing ones',
    risk: 'Low',
    automatable: true,
    files: [...new Set(failureCategories.missingDataTestId.map(f => f.file))].length,
    examples: failureCategories.missingDataTestId.slice(0, 3)
  },
  {
    pattern: 'Text Content Mismatches',
    count: failureCategories.textContentMismatch.length,
    description: 'Tests expecting specific text that doesn\'t match component output',
    effort: 2.0,
    effortPer: 0.05,
    approach: 'Update test expectations to match actual component text or fix component text',
    risk: 'Low',
    automatable: true,
    files: [...new Set(failureCategories.textContentMismatch.map(f => f.file))].length,
    examples: failureCategories.textContentMismatch.slice(0, 3)
  },
  {
    pattern: 'Mock Function Not Called',
    count: failureCategories.mockDataMismatch.length,
    description: 'Mock functions expected to be called but weren\'t (wrong event handlers or missing interactions)',
    effort: 3.0,
    effortPer: 0.1,
    approach: 'Fix event handlers, update mock setup, or correct test expectations',
    risk: 'Medium',
    automatable: false,
    files: [...new Set(failureCategories.mockDataMismatch.map(f => f.file))].length,
    examples: failureCategories.mockDataMismatch.slice(0, 3)
  },
  {
    pattern: 'Missing Accessible Elements',
    count: failureCategories.missingAccessibleElement.length,
    description: 'Tests looking for elements by role that don\'t exist or have wrong roles',
    effort: 1.5,
    effortPer: 0.075,
    approach: 'Add proper ARIA roles to components or update test queries',
    risk: 'Low',
    automatable: false,
    files: [...new Set(failureCategories.missingAccessibleElement.map(f => f.file))].length,
    examples: failureCategories.missingAccessibleElement.slice(0, 3)
  },
  {
    pattern: 'Undefined Property Access',
    count: failureCategories.undefinedProperty.length,
    description: 'Code trying to access properties of undefined/null objects',
    effort: 2.5,
    effortPer: 0.15,
    approach: 'Add null safety checks, fix mock data structure, or add optional chaining',
    risk: 'Medium',
    automatable: false,
    files: [...new Set(failureCategories.undefinedProperty.map(f => f.file))].length,
    examples: failureCategories.undefinedProperty.slice(0, 3)
  },
  {
    pattern: 'Service Integration Failures',
    count: failureCategories.serviceIntegration.length,
    description: 'Service method calls failing due to incomplete mocks or logic errors',
    effort: 4.0,
    effortPer: 0.25,
    approach: 'Complete service mocks, fix service logic, or update test setup',
    risk: 'High',
    automatable: false,
    files: [...new Set(failureCategories.serviceIntegration.map(f => f.file))].length,
    examples: failureCategories.serviceIntegration.slice(0, 3)
  },
  {
    pattern: 'Rendering Errors (VirtualizedDataGrid)',
    count: 12,
    description: 'VirtualizedDataGrid component rendering issues and ref errors',
    effort: 2.0,
    effortPer: 0.15,
    approach: 'Fix forwardRef implementation or update mock',
    risk: 'Medium',
    automatable: false,
    files: 1,
    examples: []
  },
  {
    pattern: 'Generic Rendering Errors',
    count: 189, // 201 total - 12 VirtualizedDataGrid
    description: 'Other rendering errors - multiple elements, wrong assertions, etc.',
    effort: 10.0,
    effortPer: 0.05,
    approach: 'Requires individual analysis - likely multiple root causes',
    risk: 'Variable',
    automatable: false,
    files: 50,
    examples: []
  },
  {
    pattern: 'Pending Tests (Advanced Views)',
    count: pendingAnalysis.total,
    description: '19 advanced view test files with all tests pending (likely missing implementations)',
    effort: 15.0,
    effortPer: 0.033,
    approach: 'Enable pending tests and fix failures, or delete if not needed',
    risk: 'Medium',
    automatable: false,
    files: pendingAnalysis.fileCount,
    examples: []
  }
];

// Calculate ROI
patterns.forEach(p => {
  p.totalEffort = p.effort;
  p.testsPerHour = p.count / p.totalEffort;
  p.roi = p.testsPerHour;
  p.priority = p.roi > 20 ? 'HIGH' : p.roi > 10 ? 'MEDIUM' : 'LOW';
});

// Sort by ROI
patterns.sort((a, b) => b.roi - a.roi);

console.log('\n========================================');
console.log('PRIORITIZATION MATRIX');
console.log('========================================\n');

console.log('Pattern                              | Count | Effort | ROI   | Priority | Risk   | Auto');
console.log('-------------------------------------|-------|--------|-------|----------|--------|------');
patterns.forEach(p => {
  const pattern = p.pattern.padEnd(36);
  const count = String(p.count).padStart(5);
  const effort = p.totalEffort.toFixed(1).padStart(6);
  const roi = p.roi.toFixed(1).padStart(5);
  const priority = p.priority.padEnd(8);
  const risk = p.risk.padEnd(6);
  const auto = p.automatable ? 'Yes' : 'No';
  console.log(`${pattern} | ${count} | ${effort}h | ${roi} | ${priority} | ${risk} | ${auto}`);
});

// Calculate cumulative impact
console.log('\n========================================');
console.log('CUMULATIVE IMPACT ANALYSIS');
console.log('========================================\n');

let cumulativeTests = failureAnalysis.summary.passedTests;
let cumulativeEffort = 0;

patterns.forEach((p, i) => {
  cumulativeTests += p.count;
  cumulativeEffort += p.totalEffort;
  const coverage = ((cumulativeTests / failureAnalysis.summary.totalTests) * 100).toFixed(2);

  console.log(`After Priority ${i + 1} (${p.pattern}):`);
  console.log(`  Tests Passing: ${cumulativeTests}/${failureAnalysis.summary.totalTests} (${coverage}%)`);
  console.log(`  Cumulative Effort: ${cumulativeEffort.toFixed(1)} hours`);
  console.log(`  Tests/Hour: ${(cumulativeTests / cumulativeEffort).toFixed(1)}`);
  console.log();
});

// Coverage targets
console.log('========================================');
console.log('COVERAGE TARGET ROADMAP');
console.log('========================================\n');

const currentPassing = failureAnalysis.summary.passedTests;
const totalTests = failureAnalysis.summary.totalTests;

const targets = [70, 75, 80, 85, 90, 95, 100];

targets.forEach(target => {
  const needed = Math.ceil((target / 100) * totalTests) - currentPassing;
  if (needed > 0) {
    console.log(`${target}% Coverage Target:`);
    console.log(`  Need: ${needed} more tests passing`);
    console.log(`  Total: ${currentPassing + needed}/${totalTests} tests`);

    // Find which priorities to complete
    let testsGained = 0;
    let effortNeeded = 0;
    let priorities = [];

    for (let i = 0; i < patterns.length && testsGained < needed; i++) {
      testsGained += patterns[i].count;
      effortNeeded += patterns[i].totalEffort;
      priorities.push(patterns[i].pattern);
    }

    console.log(`  Priorities: ${priorities.join(', ')}`);
    console.log(`  Estimated Effort: ${effortNeeded.toFixed(1)} hours`);
    console.log();
  }
});

// Save detailed report
const report = {
  summary: failureAnalysis.summary,
  prioritizationMatrix: patterns,
  coverageTargets: targets.map(target => {
    const needed = Math.ceil((target / 100) * totalTests) - currentPassing;
    let testsGained = 0;
    let effortNeeded = 0;
    let priorities = [];

    for (let i = 0; i < patterns.length && testsGained < needed && needed > 0; i++) {
      testsGained += patterns[i].count;
      effortNeeded += patterns[i].totalEffort;
      priorities.push(patterns[i].pattern);
    }

    return {
      target: target + '%',
      testsNeeded: Math.max(0, needed),
      totalTests: currentPassing + Math.max(0, needed),
      priorities,
      estimatedEffort: effortNeeded.toFixed(1) + ' hours'
    };
  })
};

fs.writeFileSync('prioritization-matrix.json', JSON.stringify(report, null, 2));

console.log('========================================');
console.log('Detailed report saved: prioritization-matrix.json');
console.log('========================================\n');
