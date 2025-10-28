const fs = require('fs');

// Read the test results
const results = JSON.parse(fs.readFileSync('comprehensive-test-analysis.json', 'utf8'));

// Categories for failure classification
const categories = {
  missingDataTestId: [],
  missingDataCy: [],
  textContentMismatch: [],
  missingAccessibleElement: [],
  renderingError: [],
  asyncTimeout: [],
  mockDataMismatch: [],
  serviceIntegration: [],
  undefinedProperty: [],
  moduleNotFound: [],
  other: []
};

// File/suite breakdown
const fileBreakdown = {};
const layerBreakdown = {
  hooks: { passed: 0, failed: 0, total: 0 },
  views: { passed: 0, failed: 0, total: 0 },
  services: { passed: 0, failed: 0, total: 0 },
  components: { passed: 0, failed: 0, total: 0 },
  other: { passed: 0, failed: 0, total: 0 }
};

const moduleBreakdown = {
  discovery: { passed: 0, failed: 0, total: 0 },
  analytics: { passed: 0, failed: 0, total: 0 },
  admin: { passed: 0, failed: 0, total: 0 },
  advanced: { passed: 0, failed: 0, total: 0 },
  migration: { passed: 0, failed: 0, total: 0 },
  compliance: { passed: 0, failed: 0, total: 0 },
  security: { passed: 0, failed: 0, total: 0 },
  infrastructure: { passed: 0, failed: 0, total: 0 },
  assets: { passed: 0, failed: 0, total: 0 },
  groups: { passed: 0, failed: 0, total: 0 },
  users: { passed: 0, failed: 0, total: 0 },
  licensing: { passed: 0, failed: 0, total: 0 },
  reports: { passed: 0, failed: 0, total: 0 },
  settings: { passed: 0, failed: 0, total: 0 },
  other: { passed: 0, failed: 0, total: 0 }
};

// Analyze test results
results.testResults.forEach(suite => {
  const filePath = suite.name;
  const fileName = filePath.split(/[\\/]/).pop();

  // Determine layer
  let layer = 'other';
  if (filePath.includes('/hooks/')) layer = 'hooks';
  else if (filePath.includes('/views/')) layer = 'views';
  else if (filePath.includes('/services/')) layer = 'services';
  else if (filePath.includes('/components/')) layer = 'components';

  // Determine module
  let module = 'other';
  if (filePath.includes('/discovery/')) module = 'discovery';
  else if (filePath.includes('/analytics/')) module = 'analytics';
  else if (filePath.includes('/admin/')) module = 'admin';
  else if (filePath.includes('/advanced/')) module = 'advanced';
  else if (filePath.includes('/migration/')) module = 'migration';
  else if (filePath.includes('/compliance/')) module = 'compliance';
  else if (filePath.includes('/security/')) module = 'security';
  else if (filePath.includes('/infrastructure/')) module = 'infrastructure';
  else if (filePath.includes('/assets/')) module = 'assets';
  else if (filePath.includes('/groups/')) module = 'groups';
  else if (filePath.includes('/users/')) module = 'users';
  else if (filePath.includes('/licensing/')) module = 'licensing';
  else if (filePath.includes('/reports/')) module = 'reports';
  else if (filePath.includes('/settings/')) module = 'settings';

  // Count tests
  const passed = suite.assertionResults.filter(t => t.status === 'passed').length;
  const failed = suite.assertionResults.filter(t => t.status === 'failed').length;
  const total = suite.assertionResults.length;

  // Update layer breakdown
  layerBreakdown[layer].passed += passed;
  layerBreakdown[layer].failed += failed;
  layerBreakdown[layer].total += total;

  // Update module breakdown
  moduleBreakdown[module].passed += passed;
  moduleBreakdown[module].failed += failed;
  moduleBreakdown[module].total += total;

  // File breakdown
  if (!fileBreakdown[fileName]) {
    fileBreakdown[fileName] = { passed: 0, failed: 0, total: 0, filePath };
  }
  fileBreakdown[fileName].passed += passed;
  fileBreakdown[fileName].failed += failed;
  fileBreakdown[fileName].total += total;

  // Analyze failures
  suite.assertionResults.forEach(test => {
    if (test.status === 'failed' && test.failureMessages && test.failureMessages.length > 0) {
      const message = test.failureMessages[0];
      const failureInfo = {
        file: filePath,
        testName: test.fullName,
        message: message.substring(0, 500)
      };

      if (message.includes('Unable to find an element by: [data-testid=')) {
        categories.missingDataTestId.push(failureInfo);
      } else if (message.includes('Unable to find an element by: [data-cy=')) {
        categories.missingDataCy.push(failureInfo);
      } else if (message.includes('Unable to find an element with the text:') ||
                 message.includes('Unable to find an accessible element')) {
        if (message.includes('role')) {
          categories.missingAccessibleElement.push(failureInfo);
        } else {
          categories.textContentMismatch.push(failureInfo);
        }
      } else if (message.includes('Cannot read propert') ||
                 message.includes('Cannot access') ||
                 message.includes('undefined')) {
        categories.undefinedProperty.push(failureInfo);
      } else if (message.includes('Timeout') || message.includes('timeout')) {
        categories.asyncTimeout.push(failureInfo);
      } else if (message.includes('Expected mock function') ||
                 message.includes('toHaveBeenCalled')) {
        categories.mockDataMismatch.push(failureInfo);
      } else if (message.includes('Cannot find module')) {
        categories.moduleNotFound.push(failureInfo);
      } else if (message.includes('Service') || message.includes('service')) {
        categories.serviceIntegration.push(failureInfo);
      } else if (message.includes('render')) {
        categories.renderingError.push(failureInfo);
      } else {
        categories.other.push(failureInfo);
      }
    }
  });
});

// Generate report
const report = {
  summary: {
    totalTests: results.numTotalTests,
    passedTests: results.numPassedTests,
    failedTests: results.numFailedTests,
    pendingTests: results.numPendingTests,
    passRate: ((results.numPassedTests / results.numTotalTests) * 100).toFixed(2) + '%',
    totalTestSuites: results.numTotalTestSuites,
    passedTestSuites: results.numPassedTestSuites,
    failedTestSuites: results.numFailedTestSuites
  },

  failureCategories: Object.entries(categories).map(([name, failures]) => ({
    category: name,
    count: failures.length,
    percentage: ((failures.length / results.numFailedTests) * 100).toFixed(2) + '%',
    examples: failures.slice(0, 5).map(f => ({
      file: f.file.split(/[\\/]/).slice(-3).join('/'),
      test: f.testName,
      snippet: f.message.substring(0, 200)
    }))
  })).sort((a, b) => b.count - a.count),

  layerBreakdown: Object.entries(layerBreakdown).map(([layer, stats]) => ({
    layer,
    ...stats,
    passRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) + '%' : '0%'
  })).sort((a, b) => b.total - a.total),

  moduleBreakdown: Object.entries(moduleBreakdown).map(([module, stats]) => ({
    module,
    ...stats,
    passRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) + '%' : '0%'
  })).filter(m => m.total > 0).sort((a, b) => b.failed - a.failed),

  worstFiles: Object.entries(fileBreakdown)
    .map(([name, stats]) => ({
      file: name,
      filePath: stats.filePath.split(/[\\/]/).slice(-4).join('/'),
      ...stats,
      passRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) + '%' : '0%'
    }))
    .filter(f => f.failed > 0)
    .sort((a, b) => b.failed - a.failed)
    .slice(0, 30),

  bestFiles: Object.entries(fileBreakdown)
    .map(([name, stats]) => ({
      file: name,
      filePath: stats.filePath.split(/[\\/]/).slice(-4).join('/'),
      ...stats,
      passRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) + '%' : '0%'
    }))
    .filter(f => f.total >= 5 && f.failed === 0)
    .sort((a, b) => b.passed - a.passed)
    .slice(0, 20)
};

// Save report
fs.writeFileSync('failure-analysis-comprehensive.json', JSON.stringify(report, null, 2));
fs.writeFileSync('failure-categories-detailed.json', JSON.stringify(categories, null, 2));

console.log('\n========================================');
console.log('COMPREHENSIVE TEST FAILURE ANALYSIS');
console.log('========================================\n');

console.log('SUMMARY:');
console.log(`  Total Tests: ${report.summary.totalTests}`);
console.log(`  Passed: ${report.summary.passedTests} (${report.summary.passRate})`);
console.log(`  Failed: ${report.summary.failedTests}`);
console.log(`  Pending: ${report.summary.pendingTests}`);
console.log(`  Test Suites: ${report.summary.passedTestSuites}/${report.summary.totalTestSuites}\n`);

console.log('FAILURE CATEGORIES:');
report.failureCategories.forEach(cat => {
  console.log(`  ${cat.category}: ${cat.count} (${cat.percentage})`);
});

console.log('\nLAYER BREAKDOWN:');
report.layerBreakdown.forEach(layer => {
  console.log(`  ${layer.layer}: ${layer.passed}/${layer.total} (${layer.passRate})`);
});

console.log('\nTOP 10 WORST MODULES (by failures):');
report.moduleBreakdown.slice(0, 10).forEach(mod => {
  console.log(`  ${mod.module}: ${mod.passed}/${mod.total} (${mod.passRate}) - ${mod.failed} failures`);
});

console.log('\nTOP 15 WORST FILES (by failures):');
report.worstFiles.slice(0, 15).forEach(file => {
  console.log(`  ${file.file}: ${file.passed}/${file.total} (${file.passRate})`);
});

console.log('\n========================================');
console.log('Detailed reports saved:');
console.log('  - failure-analysis-comprehensive.json');
console.log('  - failure-categories-detailed.json');
console.log('========================================\n');
