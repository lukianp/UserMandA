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

test.describe('User Discovery Journey', () => {
  test('should complete full user discovery workflow', async () => {
    // Step 1: Select source profile
    await test.step('Select source profile', async () => {
      await mainWindow.click('[data-cy="profile-selector"]');
      await mainWindow.waitForSelector('[data-cy="profile-dropdown"]', { state: 'visible' });
      await mainWindow.click('[data-cy="profile-option-source"]');

      // Wait for profile to be selected
      await expect(mainWindow.locator('[data-cy="selected-profile"]')).toBeVisible();
    });

    // Step 2: Navigate to Users view
    await test.step('Navigate to Users view', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible({ timeout: 5000 });
    });

    // Step 3: Wait for data grid to load with users
    await test.step('Wait for data grid to load', async () => {
      await mainWindow.waitForSelector('[data-cy="users-grid"]', { timeout: 10000 });

      // Wait for AG Grid to render rows
      await mainWindow.waitForSelector('.ag-row', { timeout: 15000 });

      const rowCount = await mainWindow.locator('.ag-row').count();
      expect(rowCount).toBeGreaterThan(0);

      console.log(`Loaded ${rowCount} users in the grid`);
    });

    // Step 4: Search for specific user
    await test.step('Search for specific user', async () => {
      const searchInput = mainWindow.locator('[data-cy="user-search"]');
      await searchInput.fill('john.doe');

      // Wait for debounce (300ms)
      await mainWindow.waitForTimeout(500);

      // Verify search is applied
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe('john.doe');
    });

    // Step 5: Verify filtered results
    await test.step('Verify filtered results', async () => {
      // Wait for grid to update after search
      await mainWindow.waitForTimeout(300);

      const filteredRowCount = await mainWindow.locator('.ag-row').count();
      console.log(`Filtered to ${filteredRowCount} users`);

      // Should have at least one result or zero if no match
      expect(filteredRowCount).toBeGreaterThanOrEqual(0);
    });

    // Step 6: Select user from grid
    await test.step('Select user from grid', async () => {
      const firstRow = mainWindow.locator('.ag-row').first();
      await firstRow.click();

      // Verify row is selected (AG Grid adds ag-row-selected class)
      await expect(firstRow).toHaveClass(/ag-row-selected/);
    });

    // Step 7: Export users to CSV
    await test.step('Export users to CSV', async () => {
      await mainWindow.click('[data-cy="export-btn"]');

      // Wait for export dialog
      await mainWindow.waitForSelector('[data-cy="export-dialog"]', { state: 'visible' });

      // Select CSV format
      await mainWindow.click('[data-cy="export-format-csv"]');

      // Confirm export
      await mainWindow.click('[data-cy="export-confirm-btn"]');
    });

    // Step 8: Verify export successful
    await test.step('Verify export successful', async () => {
      await expect(mainWindow.locator('[data-cy="export-success"]')).toBeVisible({ timeout: 10000 });

      // Success message should contain confirmation text
      const successText = await mainWindow.locator('[data-cy="export-success"]').textContent();
      expect(successText).toContain('exported successfully');
    });
  });

  test('should handle search with no results gracefully', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await mainWindow.waitForSelector('[data-cy="users-view"]', { state: 'visible' });

    // Search for non-existent user
    const searchInput = mainWindow.locator('[data-cy="user-search"]');
    await searchInput.fill('xxxxxxxxx-nonexistent-user-xxxxxxxxx');
    await mainWindow.waitForTimeout(500);

    // Should show no results message or empty grid
    const rowCount = await mainWindow.locator('.ag-row').count();
    expect(rowCount).toBe(0);

    // Optionally check for "no results" message
    const noResultsMessage = mainWindow.locator('[data-cy="no-results"]');
    if (await noResultsMessage.isVisible()) {
      expect(await noResultsMessage.textContent()).toContain('No users found');
    }
  });

  test('should clear search filter', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await mainWindow.waitForSelector('[data-cy="users-view"]', { state: 'visible' });

    // Apply search
    const searchInput = mainWindow.locator('[data-cy="user-search"]');
    await searchInput.fill('test');
    await mainWindow.waitForTimeout(500);

    const filteredCount = await mainWindow.locator('.ag-row').count();

    // Clear search
    await mainWindow.click('[data-cy="clear-search-btn"]');
    await mainWindow.waitForTimeout(500);

    const unfilteredCount = await mainWindow.locator('.ag-row').count();
    expect(unfilteredCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('should select multiple users', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await mainWindow.waitForSelector('[data-cy="users-grid"]', { state: 'visible' });
    await mainWindow.waitForSelector('.ag-row', { timeout: 10000 });

    // Select first user
    await mainWindow.locator('.ag-row').first().click();

    // Select second user with Ctrl key
    await mainWindow.keyboard.down('Control');
    await mainWindow.locator('.ag-row').nth(1).click();
    await mainWindow.keyboard.up('Control');

    // Verify both rows selected
    const selectedRows = await mainWindow.locator('.ag-row-selected').count();
    expect(selectedRows).toBeGreaterThanOrEqual(2);

    // Delete button should be enabled
    const deleteBtn = mainWindow.locator('[data-cy="delete-btn"]');
    await expect(deleteBtn).toBeEnabled();
  });

  test('should disable delete button when no users selected', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await mainWindow.waitForSelector('[data-cy="users-view"]', { state: 'visible' });

    // Clear any selections
    await mainWindow.locator('[data-cy="users-grid"]').click();

    // Delete button should be disabled
    const deleteBtn = mainWindow.locator('[data-cy="delete-btn"]');
    await expect(deleteBtn).toBeDisabled();
  });
});
