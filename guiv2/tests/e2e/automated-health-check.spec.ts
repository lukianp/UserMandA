/**
 * Automated Health Check Test Suite
 *
 * This test suite automatically:
 * 1. Visits every view in the application
 * 2. Captures console errors, warnings, and logs
 * 3. Detects common bugs (undefined errors, TypeScript issues, etc.)
 * 4. Takes screenshots of each view
 * 5. Validates data loading
 * 6. Generates a comprehensive health report
 *
 * Run with: npm run test:e2e:health
 */

import { test, expect, Page, ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Health check results
interface ViewHealthResult {
  route: string;
  viewName: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  logs: string[];
  screenshot: string;
  loadTime: number;
  hasData: boolean;
  missingElements: string[];
  recommendations: string[];
}

interface HealthReport {
  timestamp: string;
  totalViews: number;
  passedViews: number;
  failedViews: number;
  totalErrors: number;
  totalWarnings: number;
  results: ViewHealthResult[];
  autoFixSuggestions: AutoFixSuggestion[];
}

interface AutoFixSuggestion {
  file: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  autoFixable: boolean;
  fixCommand?: string;
  manualSteps?: string[];
}

// All routes to test
const ROUTES_TO_TEST = [
  // Dashboard
  { route: '/', name: 'Dashboard/Overview' },

  // Discovery
  { route: '/discovery/domain', name: 'Domain Discovery' },
  { route: '/discovery/azure', name: 'Azure Discovery' },
  { route: '/discovery/exchange', name: 'Exchange Discovery' },
  { route: '/discovery/sharepoint', name: 'SharePoint Discovery' },
  { route: '/discovery/teams', name: 'Teams Discovery' },
  { route: '/discovery/file-system', name: 'File System Discovery' },
  { route: '/discovery/network-devices', name: 'Network Devices' },
  { route: '/discovery/servers', name: 'Servers Discovery' },

  // Users & Groups
  { route: '/users', name: 'Users View' },
  { route: '/groups', name: 'Groups View' },
  { route: '/computers', name: 'Computers View' },

  // Migration
  { route: '/migration/planning', name: 'Migration Planning' },
  { route: '/migration/mapping', name: 'Migration Mapping' },
  { route: '/migration/validation', name: 'Migration Validation' },
  { route: '/migration/execution', name: 'Migration Execution' },

  // Analytics
  { route: '/analytics/executive', name: 'Executive Dashboard' },
  { route: '/analytics/migration-report', name: 'Migration Report' },
  { route: '/analytics/user-analytics', name: 'User Analytics' },
  { route: '/analytics/group-analytics', name: 'Group Analytics' },

  // Infrastructure
  { route: '/infrastructure/network-topology', name: 'Network Topology' },
  { route: '/infrastructure/storage-analysis', name: 'Storage Analysis' },
  { route: '/infrastructure/capacity-planning', name: 'Capacity Planning' },

  // Advanced
  { route: '/advanced/api-management', name: 'API Management' },
  { route: '/advanced/bulk-operations', name: 'Bulk Operations' },
  { route: '/advanced/custom-fields', name: 'Custom Fields' },
  { route: '/advanced/policy-management', name: 'Policy Management' },

  // Reports
  { route: '/reports', name: 'Reports' },
  { route: '/reports/compliance', name: 'Compliance Report' },
  { route: '/reports/security-audit', name: 'Security Audit' },

  // Settings
  { route: '/settings', name: 'Settings' },
];

// Create output directory for screenshots and reports
const OUTPUT_DIR = path.join(process.cwd(), 'test-results', 'health-check');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');
const REPORT_PATH = path.join(OUTPUT_DIR, 'health-report.json');
const HTML_REPORT_PATH = path.join(OUTPUT_DIR, 'health-report.html');

test.beforeAll(async () => {
  // Create output directories
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
});

test.describe('Automated Health Check - All Views', () => {
  let healthReport: HealthReport;
  let consoleMessages: Map<string, ConsoleMessage[]>;

  test.beforeAll(() => {
    healthReport = {
      timestamp: new Date().toISOString(),
      totalViews: ROUTES_TO_TEST.length,
      passedViews: 0,
      failedViews: 0,
      totalErrors: 0,
      totalWarnings: 0,
      results: [],
      autoFixSuggestions: [],
    };
    consoleMessages = new Map();
  });

  // Test each route
  for (const routeConfig of ROUTES_TO_TEST) {
    test(`Health Check: ${routeConfig.name}`, async ({ page }) => {
      const result: ViewHealthResult = {
        route: routeConfig.route,
        viewName: routeConfig.name,
        passed: true,
        errors: [],
        warnings: [],
        logs: [],
        screenshot: '',
        loadTime: 0,
        hasData: false,
        missingElements: [],
        recommendations: [],
      };

      // Capture console messages
      const messages: ConsoleMessage[] = [];
      page.on('console', (msg) => {
        messages.push(msg);
        const text = msg.text();

        if (msg.type() === 'error') {
          result.errors.push(text);
          result.passed = false;
        } else if (msg.type() === 'warning') {
          result.warnings.push(text);
        } else if (msg.type() === 'log') {
          result.logs.push(text);
        }
      });

      // Capture page errors
      page.on('pageerror', (error) => {
        result.errors.push(`Page Error: ${error.message}`);
        result.passed = false;
      });

      // Start timing
      const startTime = Date.now();

      try {
        // Navigate to route
        await page.goto(`http://localhost:3000${routeConfig.route}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        // Wait for view to render
        await page.waitForTimeout(2000);

        // Calculate load time
        result.loadTime = Date.now() - startTime;

        // Check for common elements
        const checks = [
          { selector: 'h1, h2', name: 'Page Title' },
          { selector: 'button', name: 'Interactive Buttons' },
          { selector: '[data-cy]', name: 'Test Selectors' },
        ];

        for (const check of checks) {
          const element = await page.locator(check.selector).first();
          const exists = await element.count() > 0;
          if (!exists) {
            result.missingElements.push(check.name);
            result.recommendations.push(`Add ${check.name} to ${routeConfig.name}`);
          }
        }

        // Check for data grids (views that should display data)
        const hasDataGrid = await page.locator('[role="grid"], .ag-root, table').count() > 0;
        const hasDataCards = await page.locator('[class*="card"], [class*="Card"]').count() > 0;
        result.hasData = hasDataGrid || hasDataCards;

        // Take screenshot
        const screenshotName = `${routeConfig.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
        const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        result.screenshot = screenshotPath;

        // Analyze console for common issues
        analyzeConsoleMessages(result, messages);

        // Generate recommendations
        generateRecommendations(result);

      } catch (error) {
        result.passed = false;
        result.errors.push(`Navigation failed: ${error.message}`);
      }

      // Store console messages
      consoleMessages.set(routeConfig.route, messages);

      // Update health report
      if (result.passed) {
        healthReport.passedViews++;
      } else {
        healthReport.failedViews++;
      }
      healthReport.totalErrors += result.errors.length;
      healthReport.totalWarnings += result.warnings.length;
      healthReport.results.push(result);
    });
  }

  test.afterAll(async () => {
    // Generate auto-fix suggestions
    generateAutoFixSuggestions(healthReport);

    // Save JSON report
    fs.writeFileSync(REPORT_PATH, JSON.stringify(healthReport, null, 2));
    console.log(`\n✅ Health report saved to: ${REPORT_PATH}`);

    // Generate HTML report
    generateHTMLReport(healthReport);
    console.log(`✅ HTML report saved to: ${HTML_REPORT_PATH}`);

    // Print summary
    printSummary(healthReport);
  });
});

/**
 * Analyze console messages for common issues
 */
function analyzeConsoleMessages(result: ViewHealthResult, messages: ConsoleMessage[]): void {
  const messageTexts = messages.map(m => m.text());

  // Check for undefined/null errors
  const undefinedErrors = messageTexts.filter(m =>
    m.includes('undefined') ||
    m.includes('null') ||
    m.includes('Cannot read property')
  );
  if (undefinedErrors.length > 0) {
    result.recommendations.push('Fix undefined/null reference errors');
    result.passed = false;
  }

  // Check for missing IPC handlers
  const ipcErrors = messageTexts.filter(m => m.includes('No handler for') || m.includes('IPC'));
  if (ipcErrors.length > 0) {
    result.recommendations.push('Add missing IPC handlers');
  }

  // Check for missing data
  const noDataWarnings = messageTexts.filter(m =>
    m.includes('no data') ||
    m.includes('empty array') ||
    m.includes('0 items')
  );
  if (noDataWarnings.length > 0 && !result.hasData) {
    result.recommendations.push('Ensure test data is loaded or add data loading logic');
  }

  // Check for TypeScript errors
  const tsErrors = messageTexts.filter(m => m.includes('TS') && m.includes('error'));
  if (tsErrors.length > 0) {
    result.recommendations.push('Fix TypeScript compilation errors');
    result.passed = false;
  }

  // Check for React warnings
  const reactWarnings = messageTexts.filter(m =>
    m.includes('React') ||
    m.includes('key prop') ||
    m.includes('useEffect')
  );
  if (reactWarnings.length > 0) {
    result.recommendations.push('Fix React warnings (keys, dependency arrays, etc.)');
  }
}

/**
 * Generate recommendations based on results
 */
function generateRecommendations(result: ViewHealthResult): void {
  // Slow load time
  if (result.loadTime > 5000) {
    result.recommendations.push('Optimize page load time (currently over 5s)');
  }

  // No data displayed
  if (!result.hasData && result.viewName.includes('View')) {
    result.recommendations.push('Add data grid or data display components');
  }

  // Many warnings
  if (result.warnings.length > 10) {
    result.recommendations.push('Review and fix console warnings');
  }
}

/**
 * Generate auto-fix suggestions
 */
function generateAutoFixSuggestions(report: HealthReport): void {
  const suggestions: AutoFixSuggestion[] = [];

  // Analyze all results
  for (const result of report.results) {
    // TypeScript errors
    const tsErrors = result.errors.filter(e => e.includes('TS'));
    if (tsErrors.length > 0) {
      suggestions.push({
        file: 'Multiple TypeScript files',
        issue: `${tsErrors.length} TypeScript compilation errors detected`,
        severity: 'critical',
        autoFixable: true,
        fixCommand: 'npx tsc --noEmit --pretty',
        manualSteps: [
          'Run: npx tsc --noEmit',
          'Fix reported type errors',
          'Add missing type definitions',
        ],
      });
    }

    // Missing IPC handlers
    const ipcErrors = result.errors.filter(e => e.includes('No handler'));
    if (ipcErrors.length > 0) {
      suggestions.push({
        file: 'src/main/ipcHandlers.ts',
        issue: 'Missing IPC handlers',
        severity: 'critical',
        autoFixable: false,
        manualSteps: [
          'Review error messages for missing handler names',
          'Add handlers to ipcHandlers.ts',
          'Register handlers in registerIpcHandlers()',
        ],
      });
    }

    // Undefined errors
    const undefinedErrors = result.errors.filter(e =>
      e.includes('undefined') || e.includes('Cannot read property')
    );
    if (undefinedErrors.length > 0) {
      suggestions.push({
        file: `View: ${result.viewName}`,
        issue: 'Undefined/null reference errors',
        severity: 'critical',
        autoFixable: false,
        manualSteps: [
          'Add null checks before accessing properties',
          'Use optional chaining (?.)',
          'Add default values or fallbacks',
        ],
      });
    }

    // React warnings
    const reactWarnings = result.warnings.filter(w => w.includes('React'));
    if (reactWarnings.length > 5) {
      suggestions.push({
        file: `View: ${result.viewName}`,
        issue: 'Multiple React warnings',
        severity: 'warning',
        autoFixable: true,
        fixCommand: 'npx eslint --fix src/renderer/',
        manualSteps: [
          'Add keys to list items',
          'Fix useEffect dependency arrays',
          'Remove unused variables',
        ],
      });
    }
  }

  // Deduplicate suggestions
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
    index === self.findIndex(s => s.file === suggestion.file && s.issue === suggestion.issue)
  );

  report.autoFixSuggestions = uniqueSuggestions;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(report: HealthReport): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Check Report - ${report.timestamp}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    .stat-label {
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .passed { color: #10b981; }
    .failed { color: #ef4444; }
    .warning { color: #f59e0b; }
    .view-result {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .view-result.failed {
      border-left: 4px solid #ef4444;
    }
    .view-result.passed {
      border-left: 4px solid #10b981;
    }
    .screenshot {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: 10px;
    }
    .error-list, .warning-list, .recommendation-list {
      margin: 10px 0;
      padding-left: 20px;
    }
    .error-list li { color: #ef4444; }
    .warning-list li { color: #f59e0b; }
    .fix-suggestion {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .fix-suggestion.critical {
      background: #fee2e2;
      border-left-color: #ef4444;
    }
    .code {
      background: #1f2937;
      color: #10b981;
      padding: 10px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏥 Automated Health Check Report</h1>
    <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
  </div>

  <div class="summary">
    <div class="stat-card">
      <div class="stat-label">Total Views Tested</div>
      <div class="stat-value">${report.totalViews}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Passed</div>
      <div class="stat-value passed">${report.passedViews}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Failed</div>
      <div class="stat-value failed">${report.failedViews}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Errors</div>
      <div class="stat-value failed">${report.totalErrors}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Warnings</div>
      <div class="stat-value warning">${report.totalWarnings}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Health Score</div>
      <div class="stat-value ${report.passedViews / report.totalViews > 0.8 ? 'passed' : 'failed'}">
        ${Math.round((report.passedViews / report.totalViews) * 100)}%
      </div>
    </div>
  </div>

  <h2>🔧 Auto-Fix Suggestions (${report.autoFixSuggestions.length})</h2>
  ${report.autoFixSuggestions.map(suggestion => `
    <div class="fix-suggestion ${suggestion.severity}">
      <h3>${suggestion.severity.toUpperCase()}: ${suggestion.issue}</h3>
      <p><strong>File:</strong> ${suggestion.file}</p>
      ${suggestion.fixCommand ? `
        <p><strong>Auto-fix command:</strong></p>
        <div class="code">${suggestion.fixCommand}</div>
      ` : ''}
      ${suggestion.manualSteps ? `
        <p><strong>Manual steps:</strong></p>
        <ol>
          ${suggestion.manualSteps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      ` : ''}
    </div>
  `).join('')}

  <h2>📊 View Results</h2>
  ${report.results.map(result => `
    <div class="view-result ${result.passed ? 'passed' : 'failed'}">
      <h3>${result.passed ? '✅' : '❌'} ${result.viewName}</h3>
      <p><strong>Route:</strong> ${result.route}</p>
      <p><strong>Load Time:</strong> ${result.loadTime}ms</p>
      <p><strong>Has Data:</strong> ${result.hasData ? 'Yes' : 'No'}</p>

      ${result.errors.length > 0 ? `
        <h4 style="color: #ef4444;">Errors (${result.errors.length})</h4>
        <ul class="error-list">
          ${result.errors.slice(0, 10).map(error => `<li>${error}</li>`).join('')}
          ${result.errors.length > 10 ? `<li><em>... and ${result.errors.length - 10} more</em></li>` : ''}
        </ul>
      ` : ''}

      ${result.warnings.length > 0 ? `
        <h4 style="color: #f59e0b;">Warnings (${result.warnings.length})</h4>
        <ul class="warning-list">
          ${result.warnings.slice(0, 5).map(warning => `<li>${warning}</li>`).join('')}
          ${result.warnings.length > 5 ? `<li><em>... and ${result.warnings.length - 5} more</em></li>` : ''}
        </ul>
      ` : ''}

      ${result.recommendations.length > 0 ? `
        <h4>💡 Recommendations</h4>
        <ul class="recommendation-list">
          ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      ` : ''}

      ${result.missingElements.length > 0 ? `
        <p><strong>Missing Elements:</strong> ${result.missingElements.join(', ')}</p>
      ` : ''}

      <details>
        <summary>View Screenshot</summary>
        <img src="${path.relative(OUTPUT_DIR, result.screenshot)}" alt="${result.viewName}" class="screenshot" />
      </details>
    </div>
  `).join('')}
</body>
</html>
  `;

  fs.writeFileSync(HTML_REPORT_PATH, html);
}

/**
 * Print summary to console
 */
function printSummary(report: HealthReport): void {
  console.log('\n========================================');
  console.log('🏥 AUTOMATED HEALTH CHECK SUMMARY');
  console.log('========================================\n');
  console.log(`Total Views Tested: ${report.totalViews}`);
  console.log(`✅ Passed: ${report.passedViews}`);
  console.log(`❌ Failed: ${report.failedViews}`);
  console.log(`🔴 Total Errors: ${report.totalErrors}`);
  console.log(`⚠️  Total Warnings: ${report.totalWarnings}`);
  console.log(`📊 Health Score: ${Math.round((report.passedViews / report.totalViows) * 100)}%\n`);

  console.log(`🔧 Auto-Fix Suggestions: ${report.autoFixSuggestions.length}\n`);

  if (report.autoFixSuggestions.length > 0) {
    console.log('Top Fixes:');
    report.autoFixSuggestions.slice(0, 5).forEach((suggestion, i) => {
      console.log(`  ${i + 1}. [${suggestion.severity.toUpperCase()}] ${suggestion.issue}`);
      if (suggestion.fixCommand) {
        console.log(`     Run: ${suggestion.fixCommand}`);
      }
    });
  }

  console.log('\n========================================\n');
}
