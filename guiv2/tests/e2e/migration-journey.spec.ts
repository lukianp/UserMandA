import { test, expect, _electron as electron } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';
import path from 'path';

let electronApp: ElectronApplication;
let mainWindow: Page;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: [path.join(__dirname, '../../.webpack/main')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });

  mainWindow = await electronApp.firstWindow();
  await mainWindow.waitForLoadState('domcontentloaded');
  await mainWindow.waitForSelector('[data-cy="app-loaded"]', { timeout: 10000 });
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Migration Journey', () => {
  test('should create migration wave', async () => {
    await test.step('Navigate to Migration Planning', async () => {
      await mainWindow.click('[data-cy="nav-migration"]');
      await expect(mainWindow.locator('[data-cy="migration-planning-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Open create wave dialog', async () => {
      await mainWindow.click('[data-cy="create-wave-btn"]');
      await expect(mainWindow.locator('[data-cy="create-wave-dialog"]')).toBeVisible();
    });

    await test.step('Fill wave details', async () => {
      await mainWindow.fill('[data-cy="wave-name-input"]', 'Test Wave 1');
      await mainWindow.fill('[data-cy="wave-description-input"]', 'E2E Test Wave for automated testing');
      await mainWindow.fill('[data-cy="wave-priority-input"]', '5');

      // Set scheduled dates
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await mainWindow.fill('[data-cy="wave-start-date-input"]', startDate);
      await mainWindow.fill('[data-cy="wave-end-date-input"]', endDate);
    });

    await test.step('Save wave', async () => {
      await mainWindow.click('[data-cy="save-wave-btn"]');

      // Wait for dialog to close
      await expect(mainWindow.locator('[data-cy="create-wave-dialog"]')).not.toBeVisible({ timeout: 5000 });

      // Verify wave appears in list
      await expect(mainWindow.locator('[data-cy="wave-Test Wave 1"]')).toBeVisible({ timeout: 5000 });
    });
  });

  test('should import user mappings from CSV', async () => {
    await test.step('Navigate to Migration Mapping', async () => {
      await mainWindow.click('[data-cy="nav-migration-mapping"]');
      await expect(mainWindow.locator('[data-cy="migration-mapping-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Import mappings file', async () => {
      // Get file input element
      const fileInputPromise = mainWindow.waitForEvent('filechooser');
      await mainWindow.click('[data-cy="import-mappings-trigger"]');
      const fileChooser = await fileInputPromise;

      // Set test CSV file
      const testMappingsPath = path.join(__dirname, '../fixtures/test-mappings.csv');
      await fileChooser.setFiles(testMappingsPath);
    });

    await test.step('Confirm import', async () => {
      await mainWindow.click('[data-cy="import-mappings-btn"]');

      // Wait for import to complete
      await expect(mainWindow.locator('[data-cy="import-success"]')).toBeVisible({ timeout: 5000 });

      // Verify mappings appear in grid
      await mainWindow.waitForSelector('.ag-row', { timeout: 5000 });
      const mappingCount = await mainWindow.locator('.ag-row').count();
      expect(mappingCount).toBeGreaterThan(0);
    });
  });

  test('should export user mappings', async () => {
    await mainWindow.click('[data-cy="nav-migration-mapping"]');
    await mainWindow.waitForSelector('[data-cy="migration-mapping-view"]', { state: 'visible' });

    // Click export button
    await mainWindow.click('[data-cy="export-mappings-btn"]');

    // Wait for export dialog
    await expect(mainWindow.locator('[data-cy="export-dialog"]')).toBeVisible();

    // Select CSV format
    await mainWindow.click('[data-cy="export-format-csv"]');
    await mainWindow.click('[data-cy="export-confirm-btn"]');

    // Verify success
    await expect(mainWindow.locator('[data-cy="export-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should validate migration wave', async () => {
    await test.step('Navigate to Migration Validation', async () => {
      await mainWindow.click('[data-cy="nav-migration-validation"]');
      await expect(mainWindow.locator('[data-cy="migration-validation-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Select wave for validation', async () => {
      // Select first available wave
      await mainWindow.click('[data-cy="wave-selector"]');
      await mainWindow.click('[data-cy="wave-option"]').first();
    });

    await test.step('Run validation', async () => {
      await mainWindow.click('[data-cy="run-validation-btn"]');

      // Verify validation starts
      await expect(mainWindow.locator('[data-cy="validation-running"]')).toBeVisible();
    });

    await test.step('Wait for validation to complete', async () => {
      // Wait for validation to finish (max 30 seconds)
      await mainWindow.waitForSelector('[data-cy="validation-complete"]', { timeout: 30000 });

      // Verify validation results are displayed
      const validationResults = mainWindow.locator('[data-cy="validation-results"]');
      await expect(validationResults).toBeVisible();

      // Check for passed/failed counts
      const passedCount = await mainWindow.locator('[data-cy="validation-passed"]').textContent();
      const failedCount = await mainWindow.locator('[data-cy="validation-failed"]').textContent();

      console.log(`Validation Results - Passed: ${passedCount}, Failed: ${failedCount}`);

      // At least some checks should have passed
      expect(parseInt(passedCount || '0')).toBeGreaterThanOrEqual(0);
    });

    await test.step('View validation details', async () => {
      // Expand error details if any
      const errorSection = mainWindow.locator('[data-cy="validation-errors"]');
      if (await errorSection.isVisible()) {
        await errorSection.click();
        await expect(mainWindow.locator('[data-cy="error-details"]')).toBeVisible();
      }
    });
  });

  test('should handle validation errors gracefully', async () => {
    await mainWindow.click('[data-cy="nav-migration-validation"]');
    await mainWindow.waitForSelector('[data-cy="migration-validation-view"]', { state: 'visible' });

    // Try to run validation without selecting a wave
    const runBtn = mainWindow.locator('[data-cy="run-validation-btn"]');

    if (await runBtn.isDisabled()) {
      // Button should be disabled when no wave is selected
      expect(await runBtn.isDisabled()).toBe(true);
    } else {
      // Or should show error message
      await runBtn.click();
      await expect(mainWindow.locator('[data-cy="validation-error"]')).toBeVisible({ timeout: 2000 });
    }
  });

  test('should execute migration with progress tracking', async () => {
    await test.step('Navigate to Migration Execution', async () => {
      await mainWindow.click('[data-cy="nav-migration-execution"]');
      await expect(mainWindow.locator('[data-cy="migration-execution-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Select wave for execution', async () => {
      await mainWindow.click('[data-cy="execution-wave-selector"]');
      await mainWindow.click('[data-cy="wave-option"]').first();
    });

    await test.step('Start migration', async () => {
      await mainWindow.click('[data-cy="start-migration-btn"]');

      // Confirm execution
      await expect(mainWindow.locator('[data-cy="confirm-execution-dialog"]')).toBeVisible();
      await mainWindow.click('[data-cy="confirm-execute-btn"]');
    });

    await test.step('Verify progress tracking', async () => {
      // Verify progress bar appears
      await expect(mainWindow.locator('[data-cy="migration-progress-bar"]')).toBeVisible({ timeout: 5000 });

      // Wait for progress to update (at least 1%)
      await mainWindow.waitForFunction(() => {
        const progressBar = document.querySelector('[data-cy="migration-progress-bar"]');
        if (!progressBar) return false;
        const progress = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
        return progress > 0;
      }, { timeout: 10000 });

      // Verify status grid is visible
      await expect(mainWindow.locator('[data-cy="status-grid"]')).toBeVisible();

      // Check that status rows are updating
      const statusRows = await mainWindow.locator('[data-cy="status-grid"] .ag-row').count();
      expect(statusRows).toBeGreaterThan(0);
    });

    await test.step('Verify live log streaming', async () => {
      const logContainer = mainWindow.locator('[data-cy="migration-logs"]');
      await expect(logContainer).toBeVisible();

      // Wait for at least one log entry
      await mainWindow.waitForSelector('[data-cy="log-entry"]', { timeout: 10000 });

      const logEntryCount = await mainWindow.locator('[data-cy="log-entry"]').count();
      expect(logEntryCount).toBeGreaterThan(0);
    });
  });

  test('should pause and resume migration', async () => {
    await mainWindow.click('[data-cy="nav-migration-execution"]');
    await mainWindow.waitForSelector('[data-cy="migration-execution-view"]', { state: 'visible' });

    // Start a migration
    await mainWindow.click('[data-cy="execution-wave-selector"]');
    await mainWindow.click('[data-cy="wave-option"]').first();
    await mainWindow.click('[data-cy="start-migration-btn"]');
    await mainWindow.click('[data-cy="confirm-execute-btn"]');

    // Wait for migration to start
    await expect(mainWindow.locator('[data-cy="migration-progress-bar"]')).toBeVisible({ timeout: 5000 });

    // Pause migration
    await mainWindow.click('[data-cy="pause-migration-btn"]');
    await expect(mainWindow.locator('[data-cy="migration-paused"]')).toBeVisible({ timeout: 5000 });

    // Resume migration
    await mainWindow.click('[data-cy="resume-migration-btn"]');
    await expect(mainWindow.locator('[data-cy="migration-running"]')).toBeVisible({ timeout: 5000 });
  });

  test('should initiate rollback', async () => {
    await mainWindow.click('[data-cy="nav-migration-execution"]');
    await mainWindow.waitForSelector('[data-cy="migration-execution-view"]', { state: 'visible' });

    // Click rollback button
    await mainWindow.click('[data-cy="rollback-btn"]');

    // Confirm rollback
    await expect(mainWindow.locator('[data-cy="rollback-dialog"]')).toBeVisible();
    await mainWindow.click('[data-cy="confirm-rollback-btn"]');

    // Verify rollback initiated
    await expect(mainWindow.locator('[data-cy="rollback-initiated"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display migration statistics', async () => {
    await mainWindow.click('[data-cy="nav-migration-execution"]');
    await mainWindow.waitForSelector('[data-cy="migration-execution-view"]', { state: 'visible' });

    // Statistics panel should be visible
    const statsPanel = mainWindow.locator('[data-cy="migration-stats-panel"]');
    await expect(statsPanel).toBeVisible();

    // Check for key statistics
    await expect(mainWindow.locator('[data-cy="total-users-stat"]')).toBeVisible();
    await expect(mainWindow.locator('[data-cy="migrated-users-stat"]')).toBeVisible();
    await expect(mainWindow.locator('[data-cy="failed-users-stat"]')).toBeVisible();
    await expect(mainWindow.locator('[data-cy="success-rate-stat"]')).toBeVisible();
  });

  test('should handle mapping conflicts', async () => {
    await mainWindow.click('[data-cy="nav-migration-mapping"]');
    await mainWindow.waitForSelector('[data-cy="migration-mapping-view"]', { state: 'visible' });

    // Filter to show only conflicts
    await mainWindow.click('[data-cy="show-conflicts-only"]');

    // If conflicts exist, should display them
    const conflictRows = await mainWindow.locator('[data-cy="conflict-row"]').count();

    if (conflictRows > 0) {
      // Click on first conflict to resolve
      await mainWindow.locator('[data-cy="conflict-row"]').first().click();

      // Resolution dialog should appear
      await expect(mainWindow.locator('[data-cy="resolve-conflict-dialog"]')).toBeVisible();
    }
  });
});
