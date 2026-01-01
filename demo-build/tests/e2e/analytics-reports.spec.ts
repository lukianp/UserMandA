import { test, expect, _electron as electron } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';
import path from 'path';

let electronApp: ElectronApplication;
let mainWindow: Page;

test.beforeAll(async () => {
  // Launch Electron app
  electronApp = await electron.launch({
    args: [path.join(__dirname, '../../.webpack/main')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });

  // Wait for the first window to open
  mainWindow = await electronApp.firstWindow();
  await mainWindow.waitForLoadState('domcontentloaded');

  // Wait for React to hydrate
  await mainWindow.waitForSelector('[data-cy="app-loaded"]', { timeout: 10000 });
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Analytics & Reports Views', () => {
  test('should load Executive Dashboard with KPIs', async () => {
    await test.step('Navigate to Executive Dashboard', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-executive-dashboard"]');
      await expect(mainWindow.locator('[data-cy="executive-dashboard-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify KPIs display', async () => {
      await expect(mainWindow.locator('[data-cy="kpi-total-users"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="kpi-active-migrations"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="kpi-completion-rate"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="kpi-error-rate"]')).toBeVisible();
    });

    await test.step('Verify charts render', async () => {
      await expect(mainWindow.locator('[data-cy="chart-migration-trend"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="chart-user-distribution"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="chart-license-usage"]')).toBeVisible();
    });

    await test.step('Test date range filter', async () => {
      await mainWindow.selectOption('[data-cy="dashboard-date-range"]', 'last30days');
      await mainWindow.waitForTimeout(1000); // Wait for data refresh
      await expect(mainWindow.locator('[data-cy="kpi-loading"]')).not.toBeVisible();
    });
  });

  test('should display User Analytics with charts', async () => {
    await test.step('Navigate to User Analytics', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-user-analytics"]');
      await expect(mainWindow.locator('[data-cy="user-analytics-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify user metrics', async () => {
      await expect(mainWindow.locator('[data-cy="user-total-count"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="user-growth-rate"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="user-activity-chart"]')).toBeVisible();
    });

    await test.step('Test user segmentation', async () => {
      await mainWindow.click('[data-cy="segment-by-department"]');
      await expect(mainWindow.locator('[data-cy="segmentation-chart"]')).toBeVisible();

      await mainWindow.click('[data-cy="segment-by-location"]');
      await mainWindow.waitForTimeout(500);
      await expect(mainWindow.locator('[data-cy="segmentation-chart"]')).toBeVisible();
    });

    await test.step('Export analytics data', async () => {
      await mainWindow.click('[data-cy="export-analytics-btn"]');
      await mainWindow.selectOption('[data-cy="export-format"]', 'excel');
      await mainWindow.click('[data-cy="confirm-export-btn"]');
      await expect(mainWindow.locator('[data-cy="export-success"]')).toBeVisible();
    });
  });

  test('should display Migration Report with statistics', async () => {
    await test.step('Navigate to Migration Report', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-migration-report"]');
      await expect(mainWindow.locator('[data-cy="migration-report-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify migration statistics', async () => {
      await expect(mainWindow.locator('[data-cy="stat-total-migrations"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="stat-success-rate"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="stat-avg-duration"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="stat-data-transferred"]')).toBeVisible();
    });

    await test.step('View detailed migration table', async () => {
      await expect(mainWindow.locator('[data-cy="migration-table"]')).toBeVisible();
      const rows = await mainWindow.locator('[data-cy="migration-row"]').count();
      expect(rows).toBeGreaterThan(0);
    });

    await test.step('Filter by migration status', async () => {
      await mainWindow.selectOption('[data-cy="filter-status"]', 'completed');
      await mainWindow.waitForTimeout(500);
      const filteredRows = await mainWindow.locator('[data-cy="migration-row"]').count();
      expect(filteredRows).toBeGreaterThanOrEqual(0);
    });
  });

  test('should display Cost Analysis with breakdown', async () => {
    await test.step('Navigate to Cost Analysis', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-cost-analysis"]');
      await expect(mainWindow.locator('[data-cy="cost-analysis-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify cost breakdown', async () => {
      await expect(mainWindow.locator('[data-cy="total-cost"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="cost-per-user"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="cost-breakdown-chart"]')).toBeVisible();
    });

    await test.step('View license costs', async () => {
      await mainWindow.click('[data-cy="tab-license-costs"]');
      await expect(mainWindow.locator('[data-cy="license-cost-table"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="license-distribution-chart"]')).toBeVisible();
    });

    await test.step('Generate cost report', async () => {
      await mainWindow.click('[data-cy="generate-cost-report-btn"]');
      await mainWindow.selectOption('[data-cy="report-period"]', 'quarterly');
      await mainWindow.click('[data-cy="generate-btn"]');
      await expect(mainWindow.locator('[data-cy="report-generated"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test('should work with Custom Report Builder', async () => {
    await test.step('Navigate to Custom Report Builder', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-custom-reports"]');
      await expect(mainWindow.locator('[data-cy="report-builder-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Select report fields', async () => {
      // Drag and drop fields
      const userField = await mainWindow.locator('[data-cy="field-users"]');
      const reportCanvas = await mainWindow.locator('[data-cy="report-canvas"]');
      await userField.dragTo(reportCanvas);

      const groupField = await mainWindow.locator('[data-cy="field-groups"]');
      await groupField.dragTo(reportCanvas);

      await expect(mainWindow.locator('[data-cy="selected-field-users"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="selected-field-groups"]')).toBeVisible();
    });

    await test.step('Configure filters', async () => {
      await mainWindow.click('[data-cy="add-filter-btn"]');
      await mainWindow.selectOption('[data-cy="filter-field"]', 'department');
      await mainWindow.selectOption('[data-cy="filter-operator"]', 'equals');
      await mainWindow.fill('[data-cy="filter-value"]', 'IT');
      await mainWindow.click('[data-cy="apply-filter-btn"]');
    });

    await test.step('Configure grouping', async () => {
      await mainWindow.click('[data-cy="grouping-tab"]');
      await mainWindow.selectOption('[data-cy="group-by"]', 'location');
      await mainWindow.check('[data-cy="show-subtotals"]');
    });

    await test.step('Preview and save report', async () => {
      await mainWindow.click('[data-cy="preview-report-btn"]');
      await expect(mainWindow.locator('[data-cy="report-preview"]')).toBeVisible();

      await mainWindow.fill('[data-cy="report-name"]', 'Custom User Report');
      await mainWindow.click('[data-cy="save-report-btn"]');
      await expect(mainWindow.locator('[data-cy="save-success"]')).toBeVisible();
    });
  });

  test('should manage Scheduled Reports', async () => {
    await test.step('Navigate to Scheduled Reports', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-scheduled-reports"]');
      await expect(mainWindow.locator('[data-cy="scheduled-reports-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Create new schedule', async () => {
      await mainWindow.click('[data-cy="new-schedule-btn"]');
      await expect(mainWindow.locator('[data-cy="schedule-dialog"]')).toBeVisible();

      await mainWindow.selectOption('[data-cy="report-template"]', 'user-migration-report');
      await mainWindow.selectOption('[data-cy="schedule-frequency"]', 'weekly');
      await mainWindow.fill('[data-cy="schedule-time"]', '09:00');
      await mainWindow.selectOption('[data-cy="schedule-day"]', 'monday');
    });

    await test.step('Configure recipients', async () => {
      await mainWindow.fill('[data-cy="recipient-email"]', 'admin@example.com');
      await mainWindow.click('[data-cy="add-recipient-btn"]');
      await mainWindow.fill('[data-cy="recipient-email"]', 'manager@example.com');
      await mainWindow.click('[data-cy="add-recipient-btn"]');
    });

    await test.step('Save schedule', async () => {
      await mainWindow.click('[data-cy="save-schedule-btn"]');
      await expect(mainWindow.locator('[data-cy="schedule-created"]')).toBeVisible();
    });

    await test.step('View scheduled reports list', async () => {
      await expect(mainWindow.locator('[data-cy="schedules-table"]')).toBeVisible();
      const scheduleRows = await mainWindow.locator('[data-cy="schedule-row"]').count();
      expect(scheduleRows).toBeGreaterThan(0);
    });
  });

  test('should work with Report Templates', async () => {
    await test.step('Navigate to Report Templates', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-report-templates"]');
      await expect(mainWindow.locator('[data-cy="report-templates-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('View template library', async () => {
      await expect(mainWindow.locator('[data-cy="template-grid"]')).toBeVisible();
      const templates = await mainWindow.locator('[data-cy="template-card"]').count();
      expect(templates).toBeGreaterThan(0);
    });

    await test.step('Preview template', async () => {
      await mainWindow.click('[data-cy="template-card-user-report"]');
      await mainWindow.click('[data-cy="preview-template-btn"]');
      await expect(mainWindow.locator('[data-cy="template-preview"]')).toBeVisible();
    });

    await test.step('Customize template', async () => {
      await mainWindow.click('[data-cy="customize-template-btn"]');
      await expect(mainWindow.locator('[data-cy="template-editor"]')).toBeVisible();

      await mainWindow.fill('[data-cy="template-title"]', 'My Custom User Report');
      await mainWindow.check('[data-cy="include-charts"]');
      await mainWindow.uncheck('[data-cy="include-summary"]');
    });

    await test.step('Save as new template', async () => {
      await mainWindow.click('[data-cy="save-as-new-btn"]');
      await mainWindow.fill('[data-cy="new-template-name"]', 'Custom User Template');
      await mainWindow.click('[data-cy="confirm-save-btn"]');
      await expect(mainWindow.locator('[data-cy="template-saved"]')).toBeVisible();
    });
  });

  test('should display Data Visualization with advanced charts', async () => {
    await test.step('Navigate to Data Visualization', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-data-visualization"]');
      await expect(mainWindow.locator('[data-cy="data-viz-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Select visualization type', async () => {
      await mainWindow.selectOption('[data-cy="viz-type"]', 'heatmap');
      await expect(mainWindow.locator('[data-cy="heatmap-chart"]')).toBeVisible();

      await mainWindow.selectOption('[data-cy="viz-type"]', 'sankey');
      await expect(mainWindow.locator('[data-cy="sankey-chart"]')).toBeVisible();

      await mainWindow.selectOption('[data-cy="viz-type"]', 'treemap');
      await expect(mainWindow.locator('[data-cy="treemap-chart"]')).toBeVisible();
    });

    await test.step('Configure data source', async () => {
      await mainWindow.click('[data-cy="data-source-btn"]');
      await mainWindow.selectOption('[data-cy="source-type"]', 'migration-data');
      await mainWindow.selectOption('[data-cy="date-range"]', 'last-quarter');
      await mainWindow.click('[data-cy="apply-source-btn"]');
    });

    await test.step('Customize visualization', async () => {
      await mainWindow.click('[data-cy="customize-viz-btn"]');
      await mainWindow.selectOption('[data-cy="color-scheme"]', 'gradient');
      await mainWindow.check('[data-cy="show-labels"]');
      await mainWindow.check('[data-cy="enable-zoom"]');
      await mainWindow.click('[data-cy="apply-customization-btn"]');
    });

    await test.step('Export visualization', async () => {
      await mainWindow.click('[data-cy="export-viz-btn"]');
      await mainWindow.selectOption('[data-cy="export-format"]', 'png');
      await mainWindow.click('[data-cy="download-btn"]');
      await expect(mainWindow.locator('[data-cy="download-success"]')).toBeVisible();
    });
  });

  test('should display Trend Analysis', async () => {
    await test.step('Navigate to Trend Analysis', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-trend-analysis"]');
      await expect(mainWindow.locator('[data-cy="trend-analysis-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Select metrics to analyze', async () => {
      await mainWindow.check('[data-cy="metric-user-growth"]');
      await mainWindow.check('[data-cy="metric-migration-velocity"]');
      await mainWindow.check('[data-cy="metric-error-rate"]');
      await mainWindow.click('[data-cy="analyze-btn"]');
    });

    await test.step('View trend charts', async () => {
      await expect(mainWindow.locator('[data-cy="trend-chart-user-growth"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="trend-chart-migration-velocity"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="trend-chart-error-rate"]')).toBeVisible();
    });

    await test.step('Apply forecasting', async () => {
      await mainWindow.click('[data-cy="enable-forecast"]');
      await mainWindow.selectOption('[data-cy="forecast-period"]', '3months');
      await mainWindow.click('[data-cy="generate-forecast-btn"]');
      await expect(mainWindow.locator('[data-cy="forecast-overlay"]')).toBeVisible();
    });
  });

  test('should display Benchmarking view', async () => {
    await test.step('Navigate to Benchmarking', async () => {
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.click('[data-cy="nav-benchmarking"]');
      await expect(mainWindow.locator('[data-cy="benchmarking-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Select benchmark metrics', async () => {
      await mainWindow.check('[data-cy="benchmark-performance"]');
      await mainWindow.check('[data-cy="benchmark-efficiency"]');
      await mainWindow.check('[data-cy="benchmark-quality"]');
    });

    await test.step('Configure comparison baseline', async () => {
      await mainWindow.selectOption('[data-cy="baseline-type"]', 'industry-average');
      await mainWindow.selectOption('[data-cy="industry"]', 'technology');
      await mainWindow.selectOption('[data-cy="company-size"]', 'enterprise');
    });

    await test.step('View benchmark results', async () => {
      await mainWindow.click('[data-cy="run-benchmark-btn"]');
      await mainWindow.waitForSelector('[data-cy="benchmark-results"]', { timeout: 10000 });

      await expect(mainWindow.locator('[data-cy="benchmark-score"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="benchmark-chart"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="improvement-areas"]')).toBeVisible();
    });

    await test.step('Export benchmark report', async () => {
      await mainWindow.click('[data-cy="export-benchmark-btn"]');
      await mainWindow.selectOption('[data-cy="export-format"]', 'pdf');
      await mainWindow.click('[data-cy="download-report-btn"]');
      await expect(mainWindow.locator('[data-cy="download-complete"]')).toBeVisible();
    });
  });
});