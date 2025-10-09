/**
 * Automated View Testing Script
 * Cycles through all views, captures console errors, and generates a report
 */

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

// List of all views to test
const VIEWS_TO_TEST = [
  // Overview
  { name: 'Overview', path: '/overview' },

  // Discovery Views
  { name: 'Discovery', path: '/discovery' },
  { name: 'Domain Discovery', path: '/discovery/domain' },
  { name: 'Azure Discovery', path: '/discovery/azure' },
  { name: 'AWS Discovery', path: '/discovery/aws' },
  { name: 'Exchange Discovery', path: '/discovery/exchange' },
  { name: 'SharePoint Discovery', path: '/discovery/sharepoint' },
  { name: 'Teams Discovery', path: '/discovery/teams' },
  { name: 'OneDrive Discovery', path: '/discovery/onedrive' },
  { name: 'Network Discovery', path: '/discovery/network' },
  { name: 'Applications Discovery', path: '/discovery/applications' },
  { name: 'Group Membership Discovery', path: '/discovery/group-membership' },
  { name: 'Infrastructure Audit', path: '/discovery/infrastructure-audit' },
  { name: 'Certificate Discovery', path: '/discovery/certificates' },
  { name: 'File Share Enumeration', path: '/discovery/file-shares' },

  // Data Views
  { name: 'Users', path: '/users' },
  { name: 'Groups', path: '/groups' },
  { name: 'Computers', path: '/computers' },
  { name: 'Infrastructure', path: '/infrastructure' },
  { name: 'Applications', path: '/applications' },

  // Migration Views
  { name: 'Migration Planning', path: '/migration/planning' },
  { name: 'Migration Analysis', path: '/migration/analysis' },

  // Analytics Views
  { name: 'User Analytics', path: '/analytics/users' },
  { name: 'Group Analytics', path: '/analytics/groups' },
  { name: 'Application Analytics', path: '/analytics/applications' },
  { name: 'Device Analytics', path: '/analytics/devices' },
  { name: 'Migration Readiness', path: '/analytics/migration-readiness' },
  { name: 'Cost Estimation', path: '/analytics/cost-estimation' },
  { name: 'Risk Assessment', path: '/analytics/risk-assessment' },
  { name: 'Migration Report', path: '/analytics/migration-report' },

  // Reports & Settings
  { name: 'Reports', path: '/reports' },
  { name: 'Settings', path: '/settings' },
];

let mainWindow;
let testResults = [];
let currentViewIndex = 0;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false, // Don't show window during automated testing
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '.webpack', 'main', 'preload.js'),
    },
  });

  // Capture console messages
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const view = VIEWS_TO_TEST[currentViewIndex];
    if (level === 3) { // Error level
      testResults.push({
        view: view.name,
        path: view.path,
        error: message,
        line: line,
        source: sourceId,
        timestamp: new Date().toISOString(),
      });
      console.log(`❌ [${view.name}] ERROR: ${message}`);
    }
  });

  // Load the app
  await mainWindow.loadURL('http://localhost:9000');

  // Start testing views
  await testAllViews();
}

async function testView(view) {
  console.log(`\n🔍 Testing view: ${view.name} (${view.path})`);

  try {
    // Navigate to the view
    await mainWindow.webContents.executeJavaScript(`
      window.location.hash = '${view.path}';
    `);

    // Wait for view to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if view rendered successfully
    const hasErrors = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const errors = [];

        // Check for React error boundaries
        const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
        if (errorBoundaries.length > 0) {
          errors.push('React error boundary detected');
        }

        // Check for error messages in the DOM
        const errorMessages = document.querySelectorAll('.error, [role="alert"]');
        errorMessages.forEach(el => {
          if (el.textContent.toLowerCase().includes('error')) {
            errors.push(el.textContent.trim());
          }
        });

        return errors;
      })()
    `);

    if (hasErrors.length > 0) {
      console.log(`⚠️  View has DOM errors:`, hasErrors);
      testResults.push({
        view: view.name,
        path: view.path,
        domErrors: hasErrors,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log(`✅ View loaded successfully`);
    }

  } catch (error) {
    console.log(`❌ Failed to test view:`, error.message);
    testResults.push({
      view: view.name,
      path: view.path,
      testError: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

async function testAllViews() {
  console.log(`\n🚀 Starting automated view testing...`);
  console.log(`📋 Testing ${VIEWS_TO_TEST.length} views\n`);

  for (let i = 0; i < VIEWS_TO_TEST.length; i++) {
    currentViewIndex = i;
    await testView(VIEWS_TO_TEST[i]);
  }

  // Generate report
  generateReport();

  // Exit after testing
  setTimeout(() => {
    app.quit();
  }, 1000);
}

function generateReport() {
  console.log(`\n\n📊 ========== TEST REPORT ==========\n`);

  const errorViews = testResults.filter(r => r.error || r.domErrors || r.testError);
  const successfulViews = VIEWS_TO_TEST.length - errorViews.length;

  console.log(`✅ Successful views: ${successfulViews}/${VIEWS_TO_TEST.length}`);
  console.log(`❌ Views with errors: ${errorViews.length}/${VIEWS_TO_TEST.length}\n`);

  if (errorViews.length > 0) {
    console.log(`\n🔴 ERRORS FOUND:\n`);

    errorViews.forEach((result, index) => {
      console.log(`${index + 1}. ${result.view} (${result.path})`);
      if (result.error) {
        console.log(`   Console Error: ${result.error}`);
        if (result.source) console.log(`   Source: ${result.source}:${result.line}`);
      }
      if (result.domErrors) {
        console.log(`   DOM Errors: ${result.domErrors.join(', ')}`);
      }
      if (result.testError) {
        console.log(`   Test Error: ${result.testError}`);
      }
      console.log('');
    });
  }

  // Save detailed report to file
  const reportPath = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: VIEWS_TO_TEST.length,
      successful: successfulViews,
      failed: errorViews.length,
    },
    errors: errorViews,
    allResults: testResults,
  }, null, 2));

  console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);
  console.log(`====================================\n`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
