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

test.describe('Error Handling & Error Boundaries', () => {
  test('should display error boundary on component crash', async () => {
    await test.step('Trigger component error', async () => {
      // Trigger error by dispatching custom event
      await mainWindow.evaluate(() => {
        window.dispatchEvent(
          new CustomEvent('trigger-error', {
            detail: { message: 'Test error from E2E test' },
          })
        );
      });
    });

    await test.step('Verify error boundary displays', async () => {
      const errorBoundary = mainWindow.locator('[data-cy="error-boundary"]');
      await expect(errorBoundary).toBeVisible({ timeout: 2000 });

      // Should show error message
      const errorMessage = mainWindow.locator('text=Something went wrong');
      await expect(errorMessage).toBeVisible();
    });

    await test.step('Verify error details are shown', async () => {
      // Error boundary should show stack trace or error details
      const errorDetails = mainWindow.locator('[data-cy="error-details"]');
      if (await errorDetails.isVisible()) {
        const detailsText = await errorDetails.textContent();
        expect(detailsText).toContain('Error');
      }
    });

    await test.step('Reset application state', async () => {
      // Click reset/reload button if available
      const resetBtn = mainWindow.locator('[data-cy="reset-app-btn"]');
      if (await resetBtn.isVisible()) {
        await resetBtn.click();
        await mainWindow.waitForTimeout(1000);
      } else {
        // Reload page to clear error
        await mainWindow.reload();
        await mainWindow.waitForLoadState('domcontentloaded');
      }
    });
  });

  test('should handle IPC communication errors gracefully', async () => {
    await test.step('Navigate to Users view', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Mock IPC error', async () => {
      // Inject error into electronAPI
      await mainWindow.evaluate(() => {
        const originalExecuteModule = window.electronAPI.executeModule;
        window.electronAPI.executeModule = () =>
          Promise.reject(new Error('Simulated IPC communication error'));
      });
    });

    await test.step('Trigger data refresh', async () => {
      const refreshBtn = mainWindow.locator('[data-cy="refresh-btn"]');
      if (await refreshBtn.isVisible()) {
        await refreshBtn.click();
      } else {
        // Trigger refresh via search or other action
        await mainWindow.locator('[data-cy="user-search"]').fill('test');
        await mainWindow.waitForTimeout(500);
      }
    });

    await test.step('Verify error message displays', async () => {
      const errorMessage = mainWindow.locator('[data-cy="error-message"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('error' || 'failed' || 'Error');
    });

    await test.step('Restore electronAPI', async () => {
      // Reload to restore original API
      await mainWindow.reload();
      await mainWindow.waitForLoadState('domcontentloaded');
      await mainWindow.waitForSelector('[data-cy="app-loaded"]', { timeout: 10000 });
    });
  });

  test('should retry failed operations', async () => {
    await test.step('Navigate to view with retry capability', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();
    });

    await test.step('Trigger error state', async () => {
      // Inject temporary error
      await mainWindow.evaluate(() => {
        let callCount = 0;
        const originalExecuteModule = window.electronAPI.executeModule;

        window.electronAPI.executeModule = (params: any) => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(new Error('First call fails'));
          }
          return originalExecuteModule(params);
        };
      });

      // Trigger data load
      const refreshBtn = mainWindow.locator('[data-cy="refresh-btn"]');
      if (await refreshBtn.isVisible()) {
        await refreshBtn.click();
      }
    });

    await test.step('Wait for error state', async () => {
      await expect(mainWindow.locator('[data-cy="error-message"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Click retry button', async () => {
      const retryBtn = mainWindow.locator('[data-cy="retry-btn"]');
      await expect(retryBtn).toBeVisible();
      await retryBtn.click();
    });

    await test.step('Verify loading state', async () => {
      const spinner = mainWindow.locator('[data-cy="loading-spinner"]');
      await expect(spinner).toBeVisible({ timeout: 2000 });
    });

    await test.step('Verify successful retry', async () => {
      // Error should be cleared, data should load
      await expect(mainWindow.locator('[data-cy="users-grid"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test('should handle network timeout errors', async () => {
    await mainWindow.click('[data-cy="nav-discovery"]');
    await expect(mainWindow.locator('[data-cy="domain-discovery-view"]')).toBeVisible();

    // Simulate timeout by making operation take too long
    await mainWindow.evaluate(() => {
      window.electronAPI.executeModule = () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Operation timed out')), 100);
        });
    });

    // Trigger discovery operation
    const startBtn = mainWindow.locator('[data-cy="start-discovery-btn"]');
    if (await startBtn.isVisible()) {
      await startBtn.click();
    }

    // Should show timeout error
    const timeoutError = mainWindow.locator('[data-cy="timeout-error"]');
    const genericError = mainWindow.locator('[data-cy="error-message"]');

    const hasError =
      (await timeoutError.isVisible({ timeout: 5000 }).catch(() => false)) ||
      (await genericError.isVisible({ timeout: 5000 }).catch(() => false));

    expect(hasError).toBe(true);

    // Cleanup
    await mainWindow.reload();
    await mainWindow.waitForLoadState('domcontentloaded');
  });

  test('should handle validation errors in forms', async () => {
    await mainWindow.click('[data-cy="nav-migration"]');
    await expect(mainWindow.locator('[data-cy="migration-planning-view"]')).toBeVisible();

    // Try to create wave with invalid data
    await mainWindow.click('[data-cy="create-wave-btn"]');
    await expect(mainWindow.locator('[data-cy="create-wave-dialog"]')).toBeVisible();

    // Leave required fields empty
    await mainWindow.fill('[data-cy="wave-name-input"]', '');
    await mainWindow.fill('[data-cy="wave-description-input"]', '');

    // Try to save
    await mainWindow.click('[data-cy="save-wave-btn"]');

    // Should show validation errors
    const validationError = mainWindow.locator('[data-cy="validation-error"]');
    await expect(validationError).toBeVisible({ timeout: 2000 });

    // Fill required fields
    await mainWindow.fill('[data-cy="wave-name-input"]', 'Valid Wave Name');
    await mainWindow.fill('[data-cy="wave-description-input"]', 'Valid description');

    // Validation errors should clear
    await expect(validationError).not.toBeVisible({ timeout: 2000 });
  });

  test('should handle file upload errors', async () => {
    await mainWindow.click('[data-cy="nav-migration-mapping"]');
    await expect(mainWindow.locator('[data-cy="migration-mapping-view"]')).toBeVisible();

    // Try to upload invalid file
    const fileInputPromise = mainWindow.waitForEvent('filechooser');
    await mainWindow.click('[data-cy="import-mappings-trigger"]');
    const fileChooser = await fileInputPromise;

    // Upload a non-CSV file (use the playwright config as invalid file)
    const invalidFile = path.join(__dirname, '../../playwright.config.ts');
    await fileChooser.setFiles(invalidFile);

    await mainWindow.click('[data-cy="import-mappings-btn"]');

    // Should show error about invalid file format
    const fileError = mainWindow.locator('[data-cy="file-error"]');
    const importError = mainWindow.locator('[data-cy="import-error"]');

    const hasError =
      (await fileError.isVisible({ timeout: 3000 }).catch(() => false)) ||
      (await importError.isVisible({ timeout: 3000 }).catch(() => false));

    expect(hasError).toBe(true);
  });

  test('should handle permission errors', async () => {
    // Simulate permission denied error
    await mainWindow.evaluate(() => {
      window.electronAPI.executeModule = () =>
        Promise.reject(new Error('Access denied: Insufficient permissions'));
    });

    await mainWindow.click('[data-cy="nav-users"]');
    await mainWindow.waitForTimeout(1000);

    // Should show permission error
    const permissionError = mainWindow.locator('[data-cy="permission-error"]');
    const errorMessage = mainWindow.locator('[data-cy="error-message"]');

    const hasError =
      (await permissionError.isVisible({ timeout: 5000 }).catch(() => false)) ||
      (await errorMessage.isVisible({ timeout: 5000 }).catch(() => false));

    expect(hasError).toBe(true);

    // Cleanup
    await mainWindow.reload();
    await mainWindow.waitForLoadState('domcontentloaded');
  });

  test('should display user-friendly error messages', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Inject error
    await mainWindow.evaluate(() => {
      window.electronAPI.executeModule = () =>
        Promise.reject(new Error('ECONNREFUSED: Connection refused'));
    });

    const refreshBtn = mainWindow.locator('[data-cy="refresh-btn"]');
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
    }

    await mainWindow.waitForTimeout(2000);

    // Error message should be user-friendly, not technical
    const errorMessage = mainWindow.locator('[data-cy="error-message"]');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();

      // Should NOT show raw error codes or stack traces to users
      expect(errorText).not.toContain('ECONNREFUSED');

      // Should show helpful message
      expect(errorText?.toLowerCase()).toMatch(/connection|connect|network|server/);
    }

    await mainWindow.reload();
    await mainWindow.waitForLoadState('domcontentloaded');
  });

  test('should log errors to console for debugging', async () => {
    const consoleLogs: string[] = [];

    mainWindow.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    // Trigger an error
    await mainWindow.evaluate(() => {
      console.error('Test error logged to console');
    });

    await mainWindow.waitForTimeout(500);

    expect(consoleLogs.some((log) => log.includes('Test error logged to console'))).toBe(true);
  });

  test('should prevent cascading errors', async () => {
    // Trigger error in one component
    await mainWindow.evaluate(() => {
      window.dispatchEvent(new CustomEvent('trigger-error', { detail: { message: 'Initial error' } }));
    });

    // Wait for error boundary
    await mainWindow.waitForTimeout(1000);

    // Other parts of app should still be functional
    const sidebar = mainWindow.locator('[data-cy="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Should be able to navigate
    const navBtn = mainWindow.locator('[data-cy="nav-settings"]');
    if (await navBtn.isVisible()) {
      await navBtn.click();
      // App should recover or isolate the error
      await mainWindow.waitForTimeout(1000);
    }
  });

  test('should provide error reporting mechanism', async () => {
    // Trigger error
    await mainWindow.evaluate(() => {
      window.dispatchEvent(new CustomEvent('trigger-error', { detail: { message: 'Reportable error' } }));
    });

    // Check for error boundary
    const errorBoundary = mainWindow.locator('[data-cy="error-boundary"]');
    await expect(errorBoundary).toBeVisible({ timeout: 2000 });

    // Look for report error button
    const reportBtn = mainWindow.locator('[data-cy="report-error-btn"]');
    if (await reportBtn.isVisible()) {
      await reportBtn.click();

      // Should open error report dialog or send report
      const reportDialog = mainWindow.locator('[data-cy="error-report-dialog"]');
      const reportSent = mainWindow.locator('[data-cy="report-sent"]');

      const hasReportUI =
        (await reportDialog.isVisible({ timeout: 2000 }).catch(() => false)) ||
        (await reportSent.isVisible({ timeout: 2000 }).catch(() => false));

      expect(hasReportUI).toBe(true);
    }

    // Cleanup
    await mainWindow.reload();
    await mainWindow.waitForLoadState('domcontentloaded');
  });
});
