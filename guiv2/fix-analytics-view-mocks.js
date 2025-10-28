/**
 * Fix Analytics View Test Mocks
 * Updates mock property names to match what components actually expect
 */

const fs = require('path');
const path = require('path');

const fixes = [
  {
    file: 'src/renderer/views/analytics/MigrationReportView.test.tsx',
    component: 'MigrationReportView',
    hookName: 'useMigrationReportLogic',
    mockUpdates: {
      // Change "data" to "reportData"
      data: 'reportData',
      chartData: 'chartData', // Keep as is
      kpis: 'kpis', // Keep as is
    },
    additionalProps: [
      'isExporting: false',
      'selectedWave: "all"',
      'setSelectedWave: jest.fn()',
      'availableWaves: []',
      'overallProgress: 0',
      'handleExportPDF: jest.fn()',
      'handleExportExcel: jest.fn()',
    ]
  },
  {
    file: 'src/renderer/views/analytics/TrendAnalysisView.test.tsx',
    component: 'TrendAnalysisView',
    hookName: 'useTrendAnalysisLogic',
    mockUpdates: {
      data: 'trendData',
      chartData: 'chartData',
      kpis: 'kpis',
    },
    additionalProps: [
      'timeRange: "30d"',
      'setTimeRange: jest.fn()',
      'metricType: "all"',
      'setMetricType: jest.fn()',
      'handleExport: jest.fn()',
    ]
  },
  {
    file: 'src/renderer/views/analytics/UserAnalyticsView.test.tsx',
    component: 'UserAnalyticsView',
    hookName: 'useUserAnalyticsLogic',
    mockUpdates: {
      data: 'analyticsData',
    },
    additionalProps: [
      'selectedMetric: "all"',
      'setSelectedMetric: jest.fn()',
      'dateRange: { start: "", end: "" }',
      'setDateRange: jest.fn()',
      'handleExport: jest.fn()',
    ]
  },
];

console.log('=== FIXING ANALYTICS VIEW TEST MOCKS ===\n');

let fixedCount = 0;
let errorCount = 0;

fixes.forEach(fix => {
  console.log(`Processing: ${fix.file}`);

  const filePath = path.join(__dirname, fix.file);

  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ File not found`);
    errorCount++;
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if this file has already been fixed
    if (content.includes(`${Object.values(fix.mockUpdates)[0]}:`)) {
      console.log(`  ✓ Already fixed (${Object.values(fix.mockUpdates)[0]} property found)`);
      return;
    }

    // Find the mockHookDefaults object
    const mockHookDefaultsRegex = /const mockHookDefaults = \{[\s\S]*?\};/;
    const match = content.match(mockHookDefaultsRegex);

    if (!match) {
      console.log(`  ❌ Could not find mockHookDefaults`);
      errorCount++;
      return;
    }

    const originalMock = match[0];

    // Build new mock
    let newMock = 'const mockHookDefaults = {\n';

    // Add mapped properties
    Object.entries(fix.mockUpdates).forEach(([oldProp, newProp]) => {
      if (oldProp === newProp) {
        // Keep as is
        if (originalMock.includes(`${oldProp}:`)) {
          const propMatch = originalMock.match(new RegExp(`${oldProp}:[^,]*,`, 's'));
          if (propMatch) {
            newMock += '    ' + propMatch[0].trim() + '\n';
          }
        }
      } else {
        // Rename
        if (originalMock.includes(`${oldProp}:`)) {
          const propMatch = originalMock.match(new RegExp(`${oldProp}:[^,]*,`, 's'));
          if (propMatch) {
            newMock += '    ' + propMatch[0].replace(`${oldProp}:`, `${newProp}:`).trim() + '\n';
          }
        } else {
          // Add as null
          newMock += `    ${newProp}: null as any,\n`;
        }
      }
    });

    // Add existing properties that weren't mapped
    if (originalMock.includes('isLoading:')) {
      newMock += '    isLoading: false,\n';
    }
    if (originalMock.includes('error:')) {
      newMock += '    error: null as any,\n';
    }
    if (originalMock.includes('loadData:')) {
      newMock += '    loadData: jest.fn(),\n';
    }
    if (originalMock.includes('exportData:')) {
      newMock += '    exportData: jest.fn(),\n';
    }
    if (originalMock.includes('refreshData:')) {
      newMock += '    refreshData: jest.fn(),\n';
    }
    if (originalMock.includes('pagination:')) {
      newMock += '    pagination: { page: 0, pageSize: 50, total: 0 },\n';
    }

    // Add additional props
    fix.additionalProps.forEach(prop => {
      newMock += '    ' + prop + ',\n';
    });

    newMock += '  };';

    // Replace in content
    content = content.replace(originalMock, newMock);

    // Write back
    fs.writeFileSync(filePath, content, 'utf-8');

    console.log(`  ✅ Fixed successfully`);
    fixedCount++;

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    errorCount++;
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Fixed: ${fixedCount}`);
console.log(`Errors: ${errorCount}`);
console.log(`Total: ${fixes.length}`);
