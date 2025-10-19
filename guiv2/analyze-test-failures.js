/**
 * Analyze Test Failures
 *
 * This script parses the Jest JSON report to identify common failure patterns,
 * categorize errors, and provide actionable insights for fixing remaining test failures.
 *
 * Usage: npm test -- --json --outputFile=jest-report-current.json && node analyze-test-failures.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REPORT_PATH = 'jest-report-current.json';

/**
 * Load Jest report
 */
function loadReport(reportPath) {
  if (!fs.existsSync(reportPath)) {
    console.error(`Error: Report file not found: ${reportPath}`);
    console.log('\nRun tests first:');
    console.log('  npm test -- --json --outputFile=jest-report-current.json');
    process.exit(1);
  }

  const content = fs.readFileSync(reportPath, 'utf8');
  return JSON.parse(content);
}

/**
 * Extract error patterns from failure messages
 */
function categorizeErrors(testResults) {
  const categories = {
    'Module Loading': {
      pattern: /(is not a constructor|Cannot read properties of undefined|Module .* is not defined)/i,
      count: 0,
      examples: []
    },
    'Element Not Found': {
      pattern: /(Unable to find|TestingLibraryElementError|not found)/i,
      count: 0,
      examples: []
    },
    'Type Errors': {
      pattern: /(is not a function|Cannot read property|undefined is not)/i,
      count: 0,
      examples: []
    },
    'Mock Issues': {
      pattern: /(mock.*not.*called|Expected.*calls|mock.*return)/i,
      count: 0,
      examples: []
    },
    'Async/Timing': {
      pattern: /(Exceeded timeout|Promise.*reject|async|await)/i,
      count: 0,
      examples: []
    },
    'Assertion Failures': {
      pattern: /(expect.*received|Expected.*Received|toBe|toEqual)/i,
      count: 0,
      examples: []
    },
    'Import/Export': {
      pattern: /(Cannot find module|import.*failed|export.*undefined)/i,
      count: 0,
      examples: []
    },
    'React/Rendering': {
      pattern: /(render.*fail|Invalid.*element|React)/i,
      count: 0,
      examples: []
    }
  };

  const failedTests = [];

  for (const suite of testResults) {
    for (const test of suite.assertionResults || []) {
      if (test.status === 'failed') {
        const fullMessage = test.failureMessages?.join('\n') || '';
        const testInfo = {
          file: suite.name.replace(/\\/g, '/').split('/').slice(-3).join('/'),
          testName: test.fullName,
          message: fullMessage.substring(0, 200)
        };

        failedTests.push(testInfo);

        // Categorize
        let categorized = false;
        for (const [category, config] of Object.entries(categories)) {
          if (config.pattern && config.pattern.test(fullMessage)) {
            config.count++;
            if (config.examples.length < 3) {
              config.examples.push(testInfo);
            }
            categorized = true;
            break;
          }
        }

        if (!categorized) {
          if (!categories['Other']) {
            categories['Other'] = { count: 0, examples: [] };
          }
          categories['Other'].count++;
          if (categories['Other'].examples.length < 3) {
            categories['Other'].examples.push(testInfo);
          }
        }
      }
    }
  }

  return { categories, failedTests };
}

/**
 * Identify files with highest failure rates
 */
function identifyProblematicFiles(testResults) {
  const fileStats = {};

  for (const suite of testResults) {
    const fileName = path.basename(suite.name);
    const total = suite.assertionResults?.length || 0;
    const failed = suite.assertionResults?.filter(t => t.status === 'failed').length || 0;
    const passed = suite.assertionResults?.filter(t => t.status === 'passed').length || 0;

    if (total > 0) {
      fileStats[fileName] = {
        total,
        failed,
        passed,
        failureRate: failed / total,
        path: suite.name
      };
    }
  }

  // Sort by failure count (descending)
  return Object.entries(fileStats)
    .sort((a, b) => b[1].failed - a[1].failed)
    .slice(0, 15); // Top 15
}

/**
 * Generate recommendations
 */
function generateRecommendations(categories) {
  const recommendations = [];

  if (categories['Module Loading'].count > 0) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Module Loading Issues',
      description: `${categories['Module Loading'].count} tests failing due to module loading problems`,
      actions: [
        'Check for global mocks in setupTests.ts that may interfere',
        'Ensure __esModule: true is set in mocks',
        'Verify module exports match import statements',
        'Add default export for classes if using CommonJS'
      ]
    });
  }

  if (categories['Element Not Found'].count > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'Element Not Found Errors',
      description: `${categories['Element Not Found'].count} tests can't find expected elements`,
      actions: [
        'Verify test selectors match component data-cy attributes',
        'Check if components are rendering conditionally',
        'Add waitFor() for async element appearances',
        'Review VirtualizedDataGrid mock configuration'
      ]
    });
  }

  if (categories['Type Errors'].count > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'Type/Function Errors',
      description: `${categories['Type Errors'].count} tests encountering type errors`,
      actions: [
        'Verify function exists in service implementation',
        'Check if methods are private/protected',
        'Ensure services are properly initialized',
        'Review mock implementations for completeness'
      ]
    });
  }

  if (categories['Async/Timing'].count > 0) {
    recommendations.push({
      priority: 'LOW',
      title: 'Async/Timing Issues',
      description: `${categories['Async/Timing'].count} tests with timeout or async problems`,
      actions: [
        'Add jest.advanceTimersByTime() when using fake timers',
        'Ensure async functions use await properly',
        'Increase timeout for slow integration tests',
        'Check for infinite loops or unresolved promises'
      ]
    });
  }

  return recommendations;
}

/**
 * Generate report
 */
function generateReport(report) {
  const { categories, failedTests } = categorizeErrors(report.testResults);
  const problematicFiles = identifyProblematicFiles(report.testResults);
  const recommendations = generateRecommendations(categories);

  console.log('\n' + '='.repeat(70));
  console.log('                    TEST FAILURE ANALYSIS REPORT');
  console.log('='.repeat(70) + '\n');

  // Summary
  console.log('📊 SUMMARY');
  console.log('-'.repeat(70));
  console.log(`Total Test Suites: ${report.numTotalTestSuites}`);
  console.log(`  ✅ Passed: ${report.numPassedTestSuites}`);
  console.log(`  ❌ Failed: ${report.numFailedTestSuites}`);
  console.log('');
  console.log(`Total Tests: ${report.numTotalTests}`);
  console.log(`  ✅ Passed: ${report.numPassedTests} (${(report.numPassedTests / report.numTotalTests * 100).toFixed(1)}%)`);
  console.log(`  ❌ Failed: ${report.numFailedTests} (${(report.numFailedTests / report.numTotalTests * 100).toFixed(1)}%)`);
  console.log(`  ⏭️  Skipped: ${report.numPendingTests}`);
  console.log('');

  // Error Categories
  console.log('\n🔍 ERROR CATEGORIES');
  console.log('-'.repeat(70));
  const sortedCategories = Object.entries(categories)
    .filter(([_, config]) => config.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  for (const [category, config] of sortedCategories) {
    console.log(`\n${category}: ${config.count} failures`);
    if (config.examples && config.examples.length > 0) {
      console.log('  Examples:');
      config.examples.forEach(ex => {
        console.log(`    - ${ex.file}`);
        console.log(`      ${ex.testName.substring(0, 60)}...`);
      });
    }
  }

  // Top Failing Files
  console.log('\n\n📁 TOP 15 FILES BY FAILURE COUNT');
  console.log('-'.repeat(70));
  console.log(sprintf('%-50s %6s %6s %7s', 'File', 'Failed', 'Passed', 'Rate'));
  console.log('-'.repeat(70));

  for (const [fileName, stats] of problematicFiles) {
    const rate = `${(stats.failureRate * 100).toFixed(0)}%`;
    console.log(sprintf('%-50s %6d %6d %7s',
      fileName.length > 50 ? '...' + fileName.slice(-47) : fileName,
      stats.failed,
      stats.passed,
      rate
    ));
  }

  // Recommendations
  console.log('\n\n💡 RECOMMENDATIONS');
  console.log('-'.repeat(70));

  for (const rec of recommendations) {
    const priority = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
    console.log(`\n${priority} ${rec.priority} PRIORITY: ${rec.title}`);
    console.log(`   ${rec.description}`);
    console.log('   Actions:');
    rec.actions.forEach(action => console.log(`     • ${action}`));
  }

  console.log('\n\n' + '='.repeat(70));
  console.log('                         END OF REPORT');
  console.log('='.repeat(70) + '\n');

  return {
    categories,
    problematicFiles,
    recommendations,
    summary: {
      totalSuites: report.numTotalTestSuites,
      passedSuites: report.numPassedTestSuites,
      failedSuites: report.numFailedTestSuites,
      totalTests: report.numTotalTests,
      passedTests: report.numPassedTests,
      failedTests: report.numFailedTests,
      passRate: (report.numPassedTests / report.numTotalTests * 100).toFixed(1)
    }
  };
}

/**
 * Simple sprintf implementation
 */
function sprintf(format, ...args) {
  let i = 0;
  return format.replace(/%(-)?(\d+)?([sd])/g, (match, leftAlign, width, type) => {
    let arg = String(args[i++] || '');
    if (width) {
      const w = parseInt(width);
      if (leftAlign) {
        arg = arg.padEnd(w);
      } else {
        arg = arg.padStart(w);
      }
    }
    return arg;
  });
}

/**
 * Main execution
 */
function main() {
  try {
    const report = loadReport(REPORT_PATH);
    const analysis = generateReport(report);

    // Write detailed JSON output
    const outputPath = 'test-failure-analysis.json';
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    console.log(`\n📄 Detailed analysis written to: ${outputPath}\n`);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { categorizeErrors, identifyProblematicFiles, generateRecommendations };
