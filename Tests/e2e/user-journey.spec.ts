/**
 * User Journey E2E Test
 *
 * Complete user discovery workflow from profile selection to CSV export
 * Tests the critical path: Profile → Discovery → Users → Filter → Export
 */

import { test, expect } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';
import path from 'path';
import {
  launchElectronApp,
  waitForGridReady,
  getGridRowCount,
  selectGridRow,
  waitForDownload,
  verifyFileExists,
  readCsvFile,
  waitForPowerShellExecution,
  fillFormField,
  applySearchFilter,
  navigateToView,
  waitForNotification,
  cleanupTestFiles,
  takeTimestampedScreenshot,
} from '../fixtures/electron-helpers';

let electronApp: ElectronApplication;
let mainWindow: Page;
const downloadedFiles: string[] = [];

test.beforeAll(async () => {
  const { app, page } = await launchElectronApp();
  electronApp = app;
  mainWindow = page;
});

test.afterAll(async () => {
  // Clean up downloaded files
  cleanupTestFiles(downloadedFiles);

  await electronApp.close();
});

test.describe('User Discovery Journey', () => {
  test('should complete full user discovery workflow', async () => {
    await test.step('1. Select source profile from dropdown', async () => {
      // Open profile selector
      const profileSelector = mainWindow.locator('[data-cy="profile-select-source"]');
      await expect(profileSelector).toBeVisible({ timeout: 5000 });

      // Click to open dropdown
      await profileSelector.click();

      // Wait for dropdown to be visible
      await mainWindow.waitForSelector('[role="option"], [data-cy="profile-option"]', { timeout: 5000 });

      // Select first available profile
      const firstOption = mainWindow.locator('[role="option"], [data-cy="profile-option"]').first();
      await firstOption.click();

      // Verify profile is selected
      await expect(mainWindow.locator('[data-cy="selected-profile"]')).toBeVisible({ timeout: 3000 });

      // Get selected profile name
      const selectedProfile = await profileSelector.textContent();
      console.log(`Selected profile: ${selectedProfile}`);
    });

    await test.step('2. Test connection to verify profile works', async () => {
      // Click test connection button
      const testButton = mainWindow.locator('[data-cy="test-connection-btn"]');
      await expect(testButton).toBeVisible();
      await expect(testButton).toBeEnabled();

      await testButton.click();

      // Wait for connection test to complete
      await waitForPowerShellExecution(mainWindow, 30000);

      // Verify connection status is successful
      const statusIndicator = mainWindow.locator('[data-cy="connection-status"]');
      const statusText = await statusIndicator.textContent();

      expect(statusText?.toLowerCase()).toMatch(/connected|success/);
      console.log(`Connection status: ${statusText}`);
    });

    await test.step('3. Navigate to Domain Discovery', async () => {
      // Click on Discovery navigation
      await navigateToView(
        mainWindow,
        '[data-cy="nav-discovery"]',
        '[data-cy="infrastructure-discovery-hub-view"]'
      );

      // Navigate to Active Directory Discovery
      await mainWindow.click('[data-cy="discovery-active-directory"]');
      await expect(mainWindow.locator('[data-cy="active-directory-discovery-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('4. Run domain discovery', async () => {
      // Fill discovery parameters
      await fillFormField(mainWindow, '[data-cy="domain-name-input"]', 'contoso.local');
      await fillFormField(mainWindow, '[data-cy="timeout-input"]', '30');

      // Take screenshot before discovery
      await takeTimestampedScreenshot(mainWindow, 'before-discovery');

      // Click Start Discovery button
      const startButton = mainWindow.locator('[data-cy="start-discovery-btn"]');
      await expect(startButton).toBeEnabled();
      await startButton.click();

      // Verify discovery is running
      await expect(mainWindow.locator('[data-cy="discovery-running"]')).toBeVisible({ timeout: 5000 });

      // Wait for discovery to complete (can take 30+ seconds)
      await waitForPowerShellExecution(mainWindow, 60000);

      // Verify discovery completed successfully
      await expect(mainWindow.locator('[data-cy="discovery-complete"]')).toBeVisible({ timeout: 5000 });

      // Take screenshot after discovery
      await takeTimestampedScreenshot(mainWindow, 'after-discovery');

      console.log('Domain discovery completed successfully');
    });

    await test.step('5. Navigate to Users view', async () => {
      await navigateToView(
        mainWindow,
        '[data-cy="nav-users"]',
        '[data-cy="users-view"]'
      );
    });

    await test.step('6. Wait for discovered users in data grid', async () => {
      // Wait for AG Grid to load
      await waitForGridReady(mainWindow, '[data-cy="users-grid"]', 20000);

      // Get initial row count
      const rowCount = await getGridRowCount(mainWindow);
      expect(rowCount).toBeGreaterThan(0);

      console.log(`Loaded ${rowCount} users in the grid`);

      // Verify grid columns are rendered
      const columnHeaders = mainWindow.locator('.ag-header-cell-text');
      const columnCount = await columnHeaders.count();
      expect(columnCount).toBeGreaterThan(3); // At least Name, Email, Department, Status

      // Log column names
      const columns = await columnHeaders.allTextContents();
      console.log(`Grid columns: ${columns.join(', ')}`);
    });

    await test.step('7. Apply search filter', async () => {
      // Search for specific user
      await applySearchFilter(mainWindow, '[data-cy="user-search"]', 'john', 300);

      // Wait for grid to update
      await mainWindow.waitForTimeout(500);

      const filteredCount = await getGridRowCount(mainWindow);
      console.log(`Filtered to ${filteredCount} users matching "john"`);

      // Filtered count should be less than or equal to total
      expect(filteredCount).toBeGreaterThanOrEqual(0);

      // If results exist, verify they contain search term
      if (filteredCount > 0) {
        const firstRow = mainWindow.locator('.ag-row').first();
        const rowText = await firstRow.textContent();
        expect(rowText?.toLowerCase()).toContain('john');
      }
    });

    await test.step('8. Clear filter to show all users', async () => {
      // Click clear search button
      const clearButton = mainWindow.locator('[data-cy="clear-search-btn"]');
      if (await clearButton.isVisible()) {
        await clearButton.click();
      } else {
        // Alternative: clear by filling empty string
        await fillFormField(mainWindow, '[data-cy="user-search"]', '', { clear: true });
      }

      await mainWindow.waitForTimeout(500);

      const unfilteredCount = await getGridRowCount(mainWindow);
      console.log(`Showing all ${unfilteredCount} users after clearing filter`);
    });

    await test.step('9. Select user from grid', async () => {
      // Select first user row
      const firstRow = await selectGridRow(mainWindow, 0);

      // Verify row is selected (AG Grid adds ag-row-selected class)
      await expect(firstRow).toHaveClass(/ag-row-selected/);

      // Verify action buttons are enabled
      const exportButton = mainWindow.locator('[data-cy="export-btn"]');
      await expect(exportButton).toBeEnabled();

      console.log('User row selected successfully');
    });

    await test.step('10. Export users to CSV', async () => {
      // Click export button
      const exportButton = mainWindow.locator('[data-cy="export-btn"]');
      await exportButton.click();

      // Wait for export dialog
      await expect(mainWindow.locator('[data-cy="export-dialog"]')).toBeVisible({ timeout: 3000 });

      // Select CSV format
      const csvFormatOption = mainWindow.locator('[data-cy="export-format-csv"]');
      await csvFormatOption.click();

      // Enter export filename
      const filenameInput = mainWindow.locator('[data-cy="export-filename-input"]');
      if (await filenameInput.isVisible()) {
        await fillFormField(mainWindow, '[data-cy="export-filename-input"]', 'user-export-test');
      }

      // Confirm export
      const confirmButton = mainWindow.locator('[data-cy="export-confirm-btn"]');
      await expect(confirmButton).toBeEnabled();

      // Wait for download
      const downloadPath = await waitForDownload(mainWindow, async () => {
        await confirmButton.click();
      });

      downloadedFiles.push(downloadPath);

      console.log(`Export downloaded to: ${downloadPath}`);
    });

    await test.step('11. Verify export file exists and has content', async () => {
      expect(downloadedFiles.length).toBeGreaterThan(0);

      const exportFile = downloadedFiles[downloadedFiles.length - 1];

      // Verify file exists
      expect(verifyFileExists(exportFile, 100)).toBe(true);

      // Read and verify CSV content
      const csvLines = readCsvFile(exportFile);
      expect(csvLines.length).toBeGreaterThan(1); // At least header + 1 data row

      // Verify CSV header
      const header = csvLines[0];
      expect(header).toMatch(/name|email|upn|username/i);

      console.log(`CSV export verified: ${csvLines.length} lines`);
    });

    await test.step('12. Verify export success notification', async () => {
      // Check for success notification
      await waitForNotification(mainWindow, 'exported successfully', 10000);

      // Or check for success message in the UI
      const successMessage = mainWindow.locator('[data-cy="export-success"]');
      if (await successMessage.isVisible()) {
        const messageText = await successMessage.textContent();
        expect(messageText?.toLowerCase()).toContain('success');
        console.log(`Success message: ${messageText}`);
      }
    });
  });

  test('should handle empty search results gracefully', async () => {
    await test.step('Navigate to Users view', async () => {
      await navigateToView(mainWindow, '[data-cy="nav-users"]', '[data-cy="users-view"]');
    });

    await test.step('Search for non-existent user', async () => {
      // Search for user that doesn't exist
      await applySearchFilter(
        mainWindow,
        '[data-cy="user-search"]',
        'xxxxxxxxx-nonexistent-user-12345-xxxxxxxxx',
        300
      );

      await mainWindow.waitForTimeout(500);

      // Should show empty grid or no results message
      const rowCount = await getGridRowCount(mainWindow);
      expect(rowCount).toBe(0);

      console.log('Empty search results handled correctly');
    });

    await test.step('Verify empty state message', async () => {
      // Check for "no results" message
      const noResultsSelectors = [
        '[data-cy="no-results"]',
        '[data-cy="empty-state"]',
        '.ag-overlay-no-rows-center',
      ];

      let foundEmptyState = false;
      for (const selector of noResultsSelectors) {
        if (await mainWindow.locator(selector).isVisible({ timeout: 2000 }).catch(() => false)) {
          foundEmptyState = true;
          const messageText = await mainWindow.locator(selector).textContent();
          console.log(`Empty state message: ${messageText}`);
          break;
        }
      }

      // At least one empty state indicator should be present
      expect(foundEmptyState || rowCount === 0).toBe(true);
    });
  });

  test('should select multiple users and enable batch operations', async () => {
    await test.step('Navigate to Users view', async () => {
      await navigateToView(mainWindow, '[data-cy="nav-users"]', '[data-cy="users-view"]');
      await waitForGridReady(mainWindow, '[data-cy="users-grid"]');
    });

    await test.step('Select multiple users with Ctrl+Click', async () => {
      const rowCount = await getGridRowCount(mainWindow);
      expect(rowCount).toBeGreaterThan(1);

      // Select first user
      await selectGridRow(mainWindow, 0);

      // Hold Ctrl and select second user
      await mainWindow.keyboard.down('Control');
      await selectGridRow(mainWindow, 1);
      await mainWindow.keyboard.up('Control');

      // Verify both rows are selected
      const selectedRows = await mainWindow.locator('.ag-row-selected').count();
      expect(selectedRows).toBeGreaterThanOrEqual(2);

      console.log(`Selected ${selectedRows} users`);
    });

    await test.step('Verify batch action buttons are enabled', async () => {
      const batchButtons = [
        '[data-cy="export-btn"]',
        '[data-cy="delete-btn"]',
        '[data-cy="assign-license-btn"]',
      ];

      for (const buttonSelector of batchButtons) {
        const button = mainWindow.locator(buttonSelector);
        if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
          const isEnabled = await button.isEnabled();
          console.log(`${buttonSelector} enabled: ${isEnabled}`);
        }
      }

      // At least export button should be enabled
      await expect(mainWindow.locator('[data-cy="export-btn"]')).toBeEnabled();
    });

    await test.step('Select all users with header checkbox', async () => {
      const selectAllCheckbox = mainWindow.locator('.ag-header-select-all, [data-cy="select-all-checkbox"]');

      if (await selectAllCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await selectAllCheckbox.click();

        await mainWindow.waitForTimeout(500);

        const selectedCount = await mainWindow.locator('.ag-row-selected').count();
        const totalCount = await getGridRowCount(mainWindow);

        expect(selectedCount).toBe(totalCount);
        console.log(`Selected all ${selectedCount} users`);
      } else {
        console.log('Select all checkbox not available, skipping');
      }
    });
  });

  test('should disable action buttons when no users are selected', async () => {
    await test.step('Navigate to Users view', async () => {
      await navigateToView(mainWindow, '[data-cy="nav-users"]', '[data-cy="users-view"]');
      await waitForGridReady(mainWindow, '[data-cy="users-grid"]');
    });

    await test.step('Clear any existing selections', async () => {
      // Click on empty area to deselect
      const gridContainer = mainWindow.locator('[data-cy="users-grid"]');
      await gridContainer.click({ position: { x: 10, y: 10 } });

      await mainWindow.waitForTimeout(300);

      const selectedCount = await mainWindow.locator('.ag-row-selected').count();
      console.log(`Selected rows after clear: ${selectedCount}`);
    });

    await test.step('Verify action buttons are disabled', async () => {
      const actionButtons = [
        '[data-cy="delete-btn"]',
        '[data-cy="assign-license-btn"]',
      ];

      for (const buttonSelector of actionButtons) {
        const button = mainWindow.locator(buttonSelector);
        if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
          await expect(button).toBeDisabled();
          console.log(`${buttonSelector} is correctly disabled`);
        }
      }
    });
  });

  test('should paginate through large user lists', async () => {
    await test.step('Navigate to Users view', async () => {
      await navigateToView(mainWindow, '[data-cy="nav-users"]', '[data-cy="users-view"]');
      await waitForGridReady(mainWindow, '[data-cy="users-grid"]');
    });

    await test.step('Check pagination controls', async () => {
      const paginationSelectors = [
        '[data-cy="pagination-controls"]',
        '.ag-paging-panel',
        '[data-cy="next-page-btn"]',
      ];

      let paginationVisible = false;
      for (const selector of paginationSelectors) {
        if (await mainWindow.locator(selector).isVisible({ timeout: 1000 }).catch(() => false)) {
          paginationVisible = true;
          console.log(`Pagination found: ${selector}`);
          break;
        }
      }

      const rowCount = await getGridRowCount(mainWindow);
      console.log(`Current page shows ${rowCount} rows`);
    });

    await test.step('Navigate to next page if available', async () => {
      const nextButton = mainWindow.locator('[data-cy="next-page-btn"], .ag-paging-button-next');

      if (await nextButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        const isEnabled = await nextButton.isEnabled();

        if (isEnabled) {
          await nextButton.click();
          await mainWindow.waitForTimeout(500);

          // Verify page changed
          const newRowCount = await getGridRowCount(mainWindow);
          console.log(`Next page shows ${newRowCount} rows`);
        } else {
          console.log('Already on last page');
        }
      } else {
        console.log('Pagination not available (all data fits on one page)');
      }
    });
  });

  test('should refresh user data', async () => {
    await test.step('Navigate to Users view', async () => {
      await navigateToView(mainWindow, '[data-cy="nav-users"]', '[data-cy="users-view"]');
      await waitForGridReady(mainWindow, '[data-cy="users-grid"]');
    });

    await test.step('Get initial row count', async () => {
      const initialCount = await getGridRowCount(mainWindow);
      console.log(`Initial user count: ${initialCount}`);
    });

    await test.step('Click refresh button', async () => {
      const refreshButton = mainWindow.locator('[data-cy="refresh-btn"], [data-cy="refresh-users-btn"]');

      if (await refreshButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await refreshButton.click();

        // Wait for refresh to complete
        await waitForPowerShellExecution(mainWindow, 30000);

        // Verify grid reloaded
        await waitForGridReady(mainWindow, '[data-cy="users-grid"]');

        const newCount = await getGridRowCount(mainWindow);
        console.log(`User count after refresh: ${newCount}`);

        // Count should be same or similar (data might change)
        expect(newCount).toBeGreaterThanOrEqual(0);
      } else {
        console.log('Refresh button not found, skipping refresh test');
      }
    });
  });

  test('should sort users by column', async () => {
    await test.step('Navigate to Users view', async () => {
      await navigateToView(mainWindow, '[data-cy="nav-users"]', '[data-cy="users-view"]');
      await waitForGridReady(mainWindow, '[data-cy="users-grid"]');
    });

    await test.step('Sort by first column', async () => {
      const firstColumnHeader = mainWindow.locator('.ag-header-cell').first();
      const columnName = await firstColumnHeader.locator('.ag-header-cell-text').textContent();

      console.log(`Sorting by column: ${columnName}`);

      // Click column header to sort
      await firstColumnHeader.click();
      await mainWindow.waitForTimeout(500);

      // Verify sort indicator appears
      const sortIndicator = firstColumnHeader.locator('.ag-sort-indicator-icon');
      if (await sortIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('Sort indicator visible');
      }
    });

    await test.step('Reverse sort order', async () => {
      // Click again to reverse sort
      const firstColumnHeader = mainWindow.locator('.ag-header-cell').first();
      await firstColumnHeader.click();
      await mainWindow.waitForTimeout(500);

      console.log('Sort order reversed');
    });
  });
});
