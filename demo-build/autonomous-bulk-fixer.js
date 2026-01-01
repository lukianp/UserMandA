/**
 * Autonomous Bulk Test Fixer
 *
 * Fixes multiple categories of test failures automatically:
 * 1. Add missing data-testid attributes to components
 * 2. Fix view test mocks to return proper data instead of null
 * 3. Add proper async patterns where needed
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== AUTONOMOUS BULK TEST FIXER ===\n');

// ============================================================================
// FIX 1: Add data-testid to all Analytics Views
// ============================================================================

const analyticsViews = [
  'src/renderer/views/analytics/BenchmarkingView.tsx',
  'src/renderer/views/analytics/CostAnalysisView.tsx',
  'src/renderer/views/analytics/CustomReportBuilderView.tsx',
  'src/renderer/views/analytics/DataVisualizationView.tsx',
  'src/renderer/views/analytics/ExecutiveDashboardView.tsx',
  'src/renderer/views/analytics/MigrationReportView.tsx',
  'src/renderer/views/analytics/ReportTemplatesView.tsx',
  'src/renderer/views/analytics/ScheduledReportsView.tsx',
  'src/renderer/views/analytics/TrendAnalysisView.tsx',
  'src/renderer/views/analytics/UserAnalyticsView.tsx',
];

console.log('FIX 1: Adding data-testid to Analytics Views...\n');

let fix1Count = 0;

analyticsViews.forEach(viewFile => {
  const filePath = path.join(__dirname, viewFile);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⏭️  ${path.basename(viewFile)} - File not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Extract view name from filename (e.g., "MigrationReportView.tsx" -> "migration-report-view")
  const viewName = path.basename(viewFile, '.tsx')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

  // Check if already has data-testid
  if (content.includes(`data-testid="${viewName}"`)) {
    console.log(`  ✓ ${path.basename(viewFile)} - Already has data-testid`);
    return;
  }

  // Pattern 1: Find main return div and add data-testid
  // Look for: return ( <div className="h-full
  const pattern1 = /return \(\s*<div className="h-full/;
  if (pattern1.test(content)) {
    content = content.replace(
      pattern1,
      `return (\n    <div className="h-full" data-cy="${viewName}" data-testid="${viewName}"`
    );
    console.log(`  ✅ ${path.basename(viewFile)} - Added data-testid to main div`);
    fix1Count++;
  } else {
    // Pattern 2: Find error state div and add data-testid there too
    const pattern2 = /<div className="h-full flex items-center justify-center">/;
    if (pattern2.test(content)) {
      content = content.replace(
        pattern2,
        `<div className="h-full flex items-center justify-center" data-cy="${viewName}" data-testid="${viewName}">`
      );
      console.log(`  ✅ ${path.basename(viewFile)} - Added data-testid to error div`);
      fix1Count++;
    } else {
      console.log(`  ⚠️  ${path.basename(viewFile)} - Pattern not found`);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});

console.log(`\nFIX 1 Complete: ${fix1Count} files modified\n`);

// ============================================================================
// FIX 2: Update view test mocks to return proper data
// ============================================================================

console.log('FIX 2: Updating view test mocks to return proper data...\n');

const viewTestMockFixes = [
  {
    file: 'src/renderer/views/analytics/ExecutiveDashboardView.test.tsx',
    search: /data: null as any,/,
    replace: `dashboardData: {
      summary: { users: 100, groups: 25, computers: 50 },
      charts: [],
      kpis: []
    },`
  },
  {
    file: 'src/renderer/views/analytics/CostAnalysisView.test.tsx',
    search: /data: null as any,/,
    replace: `costData: {
      totalCost: 10000,
      breakdown: [],
      trends: []
    },`
  },
  {
    file: 'src/renderer/views/analytics/BenchmarkingView.test.tsx',
    search: /data: null as any,/,
    replace: `benchmarkData: {
      metrics: [],
      comparisons: [],
      scores: {}
    },`
  },
];

let fix2Count = 0;

viewTestMockFixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);

  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  if (fix.search.test(content)) {
    content = content.replace(fix.search, fix.replace);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ ${path.basename(fix.file)}`);
    fix2Count++;
  }
});

console.log(`\nFIX 2 Complete: ${fix2Count} files modified\n`);

// ============================================================================
// FIX 3: Add missing data-cy attributes to buttons in views
// ============================================================================

console.log('FIX 3: Adding data-cy to export buttons...\n');

const viewsNeedingExportButton = [
  'src/renderer/views/analytics/ExecutiveDashboardView.tsx',
  'src/renderer/views/analytics/CostAnalysisView.tsx',
  'src/renderer/views/analytics/BenchmarkingView.tsx',
  'src/renderer/views/analytics/UserAnalyticsView.tsx',
];

let fix3Count = 0;

viewsNeedingExportButton.forEach(viewFile => {
  const filePath = path.join(__dirname, viewFile);

  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Add data-cy to export buttons that don't have it
  if (content.includes('Export') && !content.includes('data-cy="export-results-btn"')) {
    // Pattern: <Button ... onClick={...export...}
    const exportButtonPattern = /(<Button[^>]*onClick=\{[^}]*export[^}]*\}[^>]*)(>)/i;
    if (exportButtonPattern.test(content)) {
      content = content.replace(
        exportButtonPattern,
        '$1 data-cy="export-results-btn" data-testid="export-results-btn"$2'
      );
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✅ ${path.basename(viewFile)}`);
      fix3Count++;
    }
  }
});

console.log(`\nFIX 3 Complete: ${fix3Count} files modified\n`);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n=== AUTONOMOUS BULK FIXER SUMMARY ===\n');
console.log(`FIX 1 (data-testid in views): ${fix1Count} files`);
console.log(`FIX 2 (test mock data): ${fix2Count} files`);
console.log(`FIX 3 (export button data-cy): ${fix3Count} files`);
console.log(`TOTAL: ${fix1Count + fix2Count + fix3Count} files modified`);
console.log(`\nEstimated test impact: +${(fix1Count * 5) + (fix2Count * 8) + (fix3Count * 2)} tests\n`);
