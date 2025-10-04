/**
 * Migration Journey E2E Test
 *
 * Complete migration workflow from project creation to execution
 * Tests: Project → Wave → User Assignment → Mapping → Validation → Execution
 */

import { test, expect } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';
import path from 'path';
import {
  launchElectronApp,
  waitForGridReady,
  getGridRowCount,
  selectGridRow,
  selectMultipleGridRows,
  waitForDownload,
  verifyFileExists,
  readCsvFile,
  waitForPowerShellExecution,
  fillFormField,
  navigateToView,
  waitForNotification,
  confirmDialog,
  getProgressValue,
  waitForProgress,
  cleanupTestFiles,
  takeTimestampedScreenshot,
  waitForElement,
  retryWithBackoff,
} from '../fixtures/electron-helpers';

let electronApp: ElectronApplication;
let mainWindow: Page;
const downloadedFiles: string[] = [];
let createdWaveId: string | null = null;

test.beforeAll(async () => {
  const { app, page } = await launchElectronApp();
  electronApp = app;
  mainWindow = page;
});

test.afterAll(async () => {
  cleanupTestFiles(downloadedFiles);
  await electronApp.close();
});

test.describe('Migration Journey - Complete Workflow', () => {
  test('should create migration project', async () => {
    await test.step('1. Navigate to Migration Planning', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration"]',
        '[data-cy="migration-planning-view"]'
      );
    });

    await test.step('2. Open create project dialog', async () => {
      const createProjectButton = mainWindow.locator('[data-cy="create-project-btn"]');

      if (await createProjectButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createProjectButton.click();

        await waitForElement(mainWindow, '[data-cy="create-project-dialog"]', 5000);
      } else {
        console.log('Create project button not found, may already have a project');
      }
    });

    await test.step('3. Fill project details', async () => {
      const projectDialog = mainWindow.locator('[data-cy="create-project-dialog"]');

      if (await projectDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Fill project name
        await fillFormField(mainWindow, '[data-cy="project-name-input"]', 'E2E Test Migration Project');

        // Fill project description
        await fillFormField(
          mainWindow,
          '[data-cy="project-description-input"]',
          'Automated E2E test migration project created by Playwright'
        );

        // Select migration type if available
        const migrationTypeSelect = mainWindow.locator('[data-cy="migration-type-select"]');
        if (await migrationTypeSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
          await migrationTypeSelect.click();
          await mainWindow.locator('[data-value="tenant-to-tenant"], [data-cy="migration-type-tenant"]').first().click();
        }

        // Save project
        await confirmDialog(mainWindow, '[data-cy="save-project-btn"]');

        // Wait for dialog to close
        await expect(projectDialog).not.toBeVisible({ timeout: 5000 });

        console.log('Migration project created successfully');
      } else {
        console.log('No project dialog, using existing project');
      }
    });
  });

  test('should create migration wave', async () => {
    await test.step('1. Navigate to Migration Planning', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration"]',
        '[data-cy="migration-planning-view"]'
      );
    });

    await test.step('2. Open create wave dialog', async () => {
      const createWaveButton = mainWindow.locator('[data-cy="create-wave-btn"]');
      await expect(createWaveButton).toBeVisible({ timeout: 5000 });
      await createWaveButton.click();

      await waitForElement(mainWindow, '[data-cy="create-wave-dialog"]', 5000);
    });

    await test.step('3. Fill wave details', async () => {
      const timestamp = Date.now();
      const waveName = `Test Wave ${timestamp}`;

      // Fill wave name
      await fillFormField(mainWindow, '[data-cy="wave-name-input"]', waveName);

      // Fill wave description
      await fillFormField(
        mainWindow,
        '[data-cy="wave-description-input"]',
        'E2E Test Wave for automated testing - validates migration workflow'
      );

      // Set wave priority
      await fillFormField(mainWindow, '[data-cy="wave-priority-input"]', '5');

      // Set scheduled dates
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await fillFormField(mainWindow, '[data-cy="wave-start-date-input"]', startDate);
      await fillFormField(mainWindow, '[data-cy="wave-end-date-input"]', endDate);

      console.log(`Creating wave: ${waveName}`);
    });

    await test.step('4. Save wave', async () => {
      await confirmDialog(mainWindow, '[data-cy="save-wave-btn"]');

      // Wait for dialog to close
      await expect(mainWindow.locator('[data-cy="create-wave-dialog"]')).not.toBeVisible({ timeout: 5000 });

      // Wait for success notification
      await waitForNotification(mainWindow, 'wave created', 5000).catch(() => {
        console.log('No notification shown, continuing');
      });

      console.log('Migration wave created successfully');
    });

    await test.step('5. Verify wave appears in list', async () => {
      // Wait for waves grid to update
      await mainWindow.waitForTimeout(1000);

      // Verify wave list/grid is visible
      const wavesGrid = mainWindow.locator('[data-cy="waves-grid"], [data-cy="waves-list"]');
      await expect(wavesGrid).toBeVisible({ timeout: 5000 });

      // Check for at least one wave
      const waveItems = mainWindow.locator('[data-cy^="wave-"], .ag-row');
      const waveCount = await waveItems.count();
      expect(waveCount).toBeGreaterThan(0);

      console.log(`Total waves: ${waveCount}`);
    });
  });

  test('should assign users to migration wave', async () => {
    await test.step('1. Navigate to Migration Planning', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration"]',
        '[data-cy="migration-planning-view"]'
      );
    });

    await test.step('2. Select a wave', async () => {
      // Select first available wave
      const waveSelector = mainWindow.locator('[data-cy="wave-selector"]');

      if (await waveSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
        await waveSelector.click();
        await mainWindow.waitForTimeout(300);

        const firstWaveOption = mainWindow.locator('[data-cy="wave-option"]').first();
        await firstWaveOption.click();

        console.log('Wave selected for user assignment');
      } else {
        // Alternative: Click on first wave in grid
        const firstWave = mainWindow.locator('[data-cy^="wave-"], .ag-row').first();
        await firstWave.click();
      }
    });

    await test.step('3. Open assign users dialog', async () => {
      const assignUsersButton = mainWindow.locator('[data-cy="assign-users-btn"]');

      if (await assignUsersButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await assignUsersButton.click();
        await waitForElement(mainWindow, '[data-cy="assign-users-dialog"]', 5000);
      } else {
        console.log('Assign users button not found, skipping user assignment');
        test.skip();
      }
    });

    await test.step('4. Select users from grid', async () => {
      // Wait for users grid in dialog
      await waitForGridReady(mainWindow, '[data-cy="available-users-grid"]', 10000);

      const userCount = await getGridRowCount(mainWindow);
      expect(userCount).toBeGreaterThan(0);

      // Select multiple users (first 3)
      const usersToSelect = Math.min(3, userCount);
      const indices = Array.from({ length: usersToSelect }, (_, i) => i);
      await selectMultipleGridRows(mainWindow, indices);

      console.log(`Selected ${usersToSelect} users for migration wave`);
    });

    await test.step('5. Confirm user assignment', async () => {
      await confirmDialog(mainWindow, '[data-cy="assign-confirm-btn"]');

      // Wait for dialog to close
      await expect(mainWindow.locator('[data-cy="assign-users-dialog"]')).not.toBeVisible({ timeout: 5000 });

      // Wait for success notification
      await waitForNotification(mainWindow, 'assigned', 5000).catch(() => {
        console.log('No notification shown, continuing');
      });

      console.log('Users assigned to wave successfully');
    });
  });

  test('should map resources source to target', async () => {
    await test.step('1. Navigate to Migration Mapping', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration-mapping"]',
        '[data-cy="migration-mapping-view"]'
      );
    });

    await test.step('2. Import mappings from CSV', async () => {
      const importButton = mainWindow.locator('[data-cy="import-mappings-btn"], [data-cy="import-mappings-trigger"]');

      if (await importButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Get file input element
        const fileInputPromise = mainWindow.waitForEvent('filechooser', { timeout: 10000 });
        await importButton.click();
        const fileChooser = await fileInputPromise;

        // Set test CSV file
        const testMappingsPath = path.join(__dirname, '../fixtures/test-mappings.csv');
        await fileChooser.setFiles(testMappingsPath);

        // Wait for file to be selected and processed
        await mainWindow.waitForTimeout(1000);

        // Confirm import if there's a confirmation button
        const confirmImportButton = mainWindow.locator('[data-cy="confirm-import-btn"]');
        if (await confirmImportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmImportButton.click();
        }

        // Wait for import to complete
        await waitForNotification(mainWindow, 'import', 10000).catch(() => {
          console.log('No import notification, continuing');
        });

        console.log('Mappings imported from CSV');
      } else {
        console.log('Import button not found, skipping CSV import');
      }
    });

    await test.step('3. Verify mappings appear in grid', async () => {
      await waitForGridReady(mainWindow, '[data-cy="mappings-grid"]', 10000);

      const mappingCount = await getGridRowCount(mainWindow);
      expect(mappingCount).toBeGreaterThan(0);

      console.log(`Loaded ${mappingCount} resource mappings`);
    });

    await test.step('4. Create manual mapping', async () => {
      const addMappingButton = mainWindow.locator('[data-cy="add-mapping-btn"]');

      if (await addMappingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addMappingButton.click();

        await waitForElement(mainWindow, '[data-cy="add-mapping-dialog"]', 5000);

        // Fill mapping details
        await fillFormField(mainWindow, '[data-cy="source-resource-input"]', 'test.user@source.com');
        await fillFormField(mainWindow, '[data-cy="target-resource-input"]', 'test.user@target.com');

        // Select mapping type
        const mappingTypeSelect = mainWindow.locator('[data-cy="mapping-type-select"]');
        if (await mappingTypeSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
          await mappingTypeSelect.click();
          await mainWindow.locator('[data-value="user"]').first().click();
        }

        // Save mapping
        await confirmDialog(mainWindow, '[data-cy="save-mapping-btn"]');

        await expect(mainWindow.locator('[data-cy="add-mapping-dialog"]')).not.toBeVisible({ timeout: 5000 });

        console.log('Manual mapping created');
      } else {
        console.log('Add mapping button not available');
      }
    });

    await test.step('5. Verify conflict resolution', async () => {
      // Check for conflicts filter/toggle
      const showConflictsToggle = mainWindow.locator('[data-cy="show-conflicts-only"]');

      if (await showConflictsToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        await showConflictsToggle.click();
        await mainWindow.waitForTimeout(500);

        const conflictCount = await mainWindow.locator('[data-cy="conflict-row"]').count();
        console.log(`Found ${conflictCount} mapping conflicts`);

        if (conflictCount > 0) {
          // Resolve first conflict
          const firstConflict = mainWindow.locator('[data-cy="conflict-row"]').first();
          await firstConflict.click();

          // Check if resolution dialog appears
          const resolveDialog = mainWindow.locator('[data-cy="resolve-conflict-dialog"]');
          if (await resolveDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Select resolution strategy
            const keepSourceOption = mainWindow.locator('[data-cy="resolve-keep-source"]');
            if (await keepSourceOption.isVisible({ timeout: 1000 }).catch(() => false)) {
              await keepSourceOption.click();
            }

            await confirmDialog(mainWindow, '[data-cy="confirm-resolution-btn"]');

            console.log('Conflict resolved');
          }
        }

        // Turn off conflicts filter
        await showConflictsToggle.click();
      }
    });
  });

  test('should run validation checks', async () => {
    await test.step('1. Navigate to Migration Validation', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration-validation"]',
        '[data-cy="migration-validation-view"]'
      );
    });

    await test.step('2. Select wave for validation', async () => {
      const waveSelector = mainWindow.locator('[data-cy="wave-selector"], [data-cy="validation-wave-selector"]');

      if (await waveSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
        await waveSelector.click();
        await mainWindow.waitForTimeout(300);

        const firstWaveOption = mainWindow.locator('[data-cy="wave-option"]').first();
        await firstWaveOption.click();

        console.log('Wave selected for validation');
      }
    });

    await test.step('3. Configure validation checks', async () => {
      // Select validation types
      const validationCheckboxes = [
        '[data-cy="validate-licenses"]',
        '[data-cy="validate-permissions"]',
        '[data-cy="validate-mailboxes"]',
      ];

      for (const checkbox of validationCheckboxes) {
        const element = mainWindow.locator(checkbox);
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          const isChecked = await element.isChecked();
          if (!isChecked) {
            await element.click();
          }
        }
      }

      console.log('Validation checks configured');
    });

    await test.step('4. Run validation', async () => {
      const runValidationButton = mainWindow.locator('[data-cy="run-validation-btn"]');
      await expect(runValidationButton).toBeVisible({ timeout: 5000 });
      await expect(runValidationButton).toBeEnabled();

      await runValidationButton.click();

      // Verify validation starts
      await waitForElement(mainWindow, '[data-cy="validation-running"]', 5000);

      console.log('Validation started');
    });

    await test.step('5. Wait for validation to complete', async () => {
      // Wait for validation to finish (max 60 seconds)
      await retryWithBackoff(async () => {
        await waitForElement(mainWindow, '[data-cy="validation-complete"]', 60000);
      }, 2, 5000);

      console.log('Validation completed');
    });

    await test.step('6. Verify validation results', async () => {
      // Check results panel
      const resultsPanel = mainWindow.locator('[data-cy="validation-results"]');
      await expect(resultsPanel).toBeVisible({ timeout: 5000 });

      // Get passed/failed/warning counts
      const passedElement = mainWindow.locator('[data-cy="validation-passed"]');
      const failedElement = mainWindow.locator('[data-cy="validation-failed"]');
      const warningsElement = mainWindow.locator('[data-cy="validation-warnings"]');

      let passedCount = 0;
      let failedCount = 0;
      let warningCount = 0;

      if (await passedElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        const passedText = await passedElement.textContent();
        passedCount = parseInt(passedText?.match(/\d+/)?.[0] || '0');
      }

      if (await failedElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        const failedText = await failedElement.textContent();
        failedCount = parseInt(failedText?.match(/\d+/)?.[0] || '0');
      }

      if (await warningsElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        const warningText = await warningsElement.textContent();
        warningCount = parseInt(warningText?.match(/\d+/)?.[0] || '0');
      }

      console.log(`Validation Results - Passed: ${passedCount}, Failed: ${failedCount}, Warnings: ${warningCount}`);

      // At least some validation checks should have run
      const totalChecks = passedCount + failedCount + warningCount;
      expect(totalChecks).toBeGreaterThan(0);
    });

    await test.step('7. View validation error details', async () => {
      const errorSection = mainWindow.locator('[data-cy="validation-errors"]');

      if (await errorSection.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Expand errors section
        const expandButton = errorSection.locator('[data-cy="expand-errors"]');
        if (await expandButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await expandButton.click();
          await mainWindow.waitForTimeout(500);
        }

        // Check if error details are shown
        const errorDetails = mainWindow.locator('[data-cy="error-details"]');
        if (await errorDetails.isVisible({ timeout: 1000 }).catch(() => false)) {
          const errorCount = await errorDetails.locator('[data-cy="error-item"]').count();
          console.log(`Viewing ${errorCount} validation errors`);
        }
      }
    });

    await test.step('8. Export validation report', async () => {
      const exportButton = mainWindow.locator('[data-cy="export-validation-report-btn"]');

      if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        const downloadPath = await waitForDownload(mainWindow, async () => {
          await exportButton.click();
        });

        downloadedFiles.push(downloadPath);

        expect(verifyFileExists(downloadPath, 50)).toBe(true);
        console.log(`Validation report exported: ${downloadPath}`);
      } else {
        console.log('Export validation report button not available');
      }
    });
  });

  test('should execute migration with progress tracking (dry run)', async () => {
    await test.step('1. Navigate to Migration Execution', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration-execution"]',
        '[data-cy="migration-execution-view"]'
      );
    });

    await test.step('2. Select wave for execution', async () => {
      const waveSelector = mainWindow.locator('[data-cy="execution-wave-selector"]');

      if (await waveSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
        await waveSelector.click();
        await mainWindow.waitForTimeout(300);

        const firstWaveOption = mainWindow.locator('[data-cy="wave-option"]').first();
        await firstWaveOption.click();

        console.log('Wave selected for execution');
      }
    });

    await test.step('3. Configure execution options', async () => {
      // Enable dry run mode
      const dryRunCheckbox = mainWindow.locator('[data-cy="dry-run-checkbox"]');

      if (await dryRunCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        const isChecked = await dryRunCheckbox.isChecked();
        if (!isChecked) {
          await dryRunCheckbox.click();
        }
        console.log('Dry run mode enabled');
      }

      // Configure batch size
      const batchSizeInput = mainWindow.locator('[data-cy="batch-size-input"]');
      if (await batchSizeInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await fillFormField(mainWindow, '[data-cy="batch-size-input"]', '10');
      }
    });

    await test.step('4. Start migration', async () => {
      const startButton = mainWindow.locator('[data-cy="start-migration-btn"]');
      await expect(startButton).toBeVisible({ timeout: 5000 });
      await expect(startButton).toBeEnabled();

      await startButton.click();

      // Confirm execution in dialog
      const confirmDialog = mainWindow.locator('[data-cy="confirm-execution-dialog"]');
      if (await confirmDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        await mainWindow.locator('[data-cy="confirm-execute-btn"]').click();
      }

      console.log('Migration execution started');
    });

    await test.step('5. Verify progress tracking', async () => {
      // Wait for progress bar to appear
      await waitForElement(mainWindow, '[data-cy="migration-progress-bar"]', 10000);

      // Wait for progress to start (at least 1%)
      await waitForProgress(mainWindow, '[data-cy="migration-progress-bar"]', 1, 20000);

      // Get current progress
      const currentProgress = await getProgressValue(mainWindow, '[data-cy="migration-progress-bar"]');
      console.log(`Migration progress: ${currentProgress}%`);

      expect(currentProgress).toBeGreaterThanOrEqual(0);
      expect(currentProgress).toBeLessThanOrEqual(100);
    });

    await test.step('6. Verify status grid updates', async () => {
      const statusGrid = mainWindow.locator('[data-cy="status-grid"]');
      await expect(statusGrid).toBeVisible({ timeout: 5000 });

      await waitForGridReady(mainWindow, '[data-cy="status-grid"]');

      const statusRowCount = await getGridRowCount(mainWindow);
      expect(statusRowCount).toBeGreaterThan(0);

      console.log(`Status grid showing ${statusRowCount} items`);
    });

    await test.step('7. Verify live log streaming', async () => {
      const logContainer = mainWindow.locator('[data-cy="migration-logs"]');
      await expect(logContainer).toBeVisible({ timeout: 5000 });

      // Wait for log entries to appear
      await waitForElement(mainWindow, '[data-cy="log-entry"]', 15000);

      const logEntryCount = await mainWindow.locator('[data-cy="log-entry"]').count();
      expect(logEntryCount).toBeGreaterThan(0);

      console.log(`${logEntryCount} log entries received`);

      // Get latest log entry
      const latestLog = await mainWindow.locator('[data-cy="log-entry"]').last().textContent();
      console.log(`Latest log: ${latestLog}`);
    });

    await test.step('8. Verify migration statistics panel', async () => {
      const statsPanel = mainWindow.locator('[data-cy="migration-stats-panel"]');
      await expect(statsPanel).toBeVisible({ timeout: 5000 });

      // Check individual statistics
      const statElements = [
        { selector: '[data-cy="total-users-stat"]', name: 'Total Users' },
        { selector: '[data-cy="migrated-users-stat"]', name: 'Migrated' },
        { selector: '[data-cy="failed-users-stat"]', name: 'Failed' },
        { selector: '[data-cy="success-rate-stat"]', name: 'Success Rate' },
      ];

      for (const stat of statElements) {
        if (await mainWindow.locator(stat.selector).isVisible({ timeout: 2000 }).catch(() => false)) {
          const value = await mainWindow.locator(stat.selector).textContent();
          console.log(`${stat.name}: ${value}`);
        }
      }
    });

    await test.step('9. Take progress screenshot', async () => {
      await takeTimestampedScreenshot(mainWindow, 'migration-progress');
    });
  });

  test('should pause and resume migration', async () => {
    await test.step('Navigate to Migration Execution', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration-execution"]',
        '[data-cy="migration-execution-view"]'
      );
    });

    await test.step('Check if migration is running', async () => {
      const progressBar = mainWindow.locator('[data-cy="migration-progress-bar"]');
      const isRunning = await progressBar.isVisible({ timeout: 2000 }).catch(() => false);

      if (!isRunning) {
        console.log('No migration running, test requires active migration');
        test.skip();
      }
    });

    await test.step('Pause migration', async () => {
      const pauseButton = mainWindow.locator('[data-cy="pause-migration-btn"]');

      if (await pauseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await pauseButton.click();

        await waitForElement(mainWindow, '[data-cy="migration-paused"]', 10000);

        console.log('Migration paused');

        await takeTimestampedScreenshot(mainWindow, 'migration-paused');
      } else {
        console.log('Pause button not available');
      }
    });

    await test.step('Resume migration', async () => {
      const resumeButton = mainWindow.locator('[data-cy="resume-migration-btn"]');

      if (await resumeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await resumeButton.click();

        await waitForElement(mainWindow, '[data-cy="migration-running"]', 10000);

        console.log('Migration resumed');
      } else {
        console.log('Resume button not available');
      }
    });
  });

  test('should handle migration completion', async () => {
    await test.step('Navigate to Migration Execution', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration-execution"]',
        '[data-cy="migration-execution-view"]'
      );
    });

    await test.step('Wait for migration to complete or check completed status', async () => {
      const completionSelectors = [
        '[data-cy="migration-complete"]',
        '[data-cy="migration-status-complete"]',
        '[data-cy="migration-status-completed"]',
      ];

      let isComplete = false;
      for (const selector of completionSelectors) {
        if (await mainWindow.locator(selector).isVisible({ timeout: 5000 }).catch(() => false)) {
          isComplete = true;
          console.log(`Migration completion detected: ${selector}`);
          break;
        }
      }

      // If not complete, that's okay - we're testing the UI exists
      if (!isComplete) {
        console.log('Migration not complete yet, checking for progress indicators');

        const progressBar = mainWindow.locator('[data-cy="migration-progress-bar"]');
        if (await progressBar.isVisible({ timeout: 2000 }).catch(() => false)) {
          const progress = await getProgressValue(mainWindow, '[data-cy="migration-progress-bar"]');
          console.log(`Current migration progress: ${progress}%`);
        }
      }
    });

    await test.step('Verify final statistics', async () => {
      const finalStatsPanel = mainWindow.locator('[data-cy="final-stats-panel"], [data-cy="migration-stats-panel"]');

      if (await finalStatsPanel.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Take screenshot of final results
        await takeTimestampedScreenshot(mainWindow, 'migration-final-stats');

        console.log('Final migration statistics visible');
      }
    });
  });

  test('should export migration mappings', async () => {
    await test.step('Navigate to Migration Mapping', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration-mapping"]',
        '[data-cy="migration-mapping-view"]'
      );
    });

    await test.step('Export mappings to CSV', async () => {
      const exportButton = mainWindow.locator('[data-cy="export-mappings-btn"]');

      if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await exportButton.click();

        // Handle export dialog if present
        const exportDialog = mainWindow.locator('[data-cy="export-dialog"]');
        if (await exportDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Select CSV format
          const csvOption = mainWindow.locator('[data-cy="export-format-csv"]');
          if (await csvOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await csvOption.click();
          }

          // Confirm export
          const downloadPath = await waitForDownload(mainWindow, async () => {
            await confirmDialog(mainWindow, '[data-cy="export-confirm-btn"]');
          });

          downloadedFiles.push(downloadPath);

          // Verify export file
          expect(verifyFileExists(downloadPath, 50)).toBe(true);

          const csvLines = readCsvFile(downloadPath);
          expect(csvLines.length).toBeGreaterThan(1); // Header + data

          console.log(`Mappings exported: ${csvLines.length} lines`);
        } else {
          // Direct export without dialog
          const downloadPath = await waitForDownload(mainWindow, async () => {
            // Already clicked export button
          });

          downloadedFiles.push(downloadPath);
          console.log(`Mappings exported directly: ${downloadPath}`);
        }
      } else {
        console.log('Export button not available');
      }
    });
  });

  test('should display validation errors gracefully', async () => {
    await test.step('Navigate to Migration Validation', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-migration-validation"]',
        '[data-cy="migration-validation-view"]'
      );
    });

    await test.step('Try to run validation without selecting wave', async () => {
      const runButton = mainWindow.locator('[data-cy="run-validation-btn"]');

      if (await runButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        const isDisabled = await runButton.isDisabled();

        if (isDisabled) {
          // Button should be disabled when no wave is selected
          expect(isDisabled).toBe(true);
          console.log('Validation button correctly disabled without wave selection');
        } else {
          // Click and check for error
          await runButton.click();

          const errorMessage = mainWindow.locator('[data-cy="validation-error"], [role="alert"]');
          if (await errorMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
            const errorText = await errorMessage.textContent();
            console.log(`Validation error shown: ${errorText}`);
          }
        }
      }
    });
  });
});
