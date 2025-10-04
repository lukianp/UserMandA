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

test.describe('Settings Management', () => {
  test.beforeEach(async () => {
    // Navigate to Settings view
    await mainWindow.click('[data-cy="nav-settings"]');
    await expect(mainWindow.locator('[data-cy="settings-view"]')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to settings view', async () => {
    await expect(mainWindow.locator('[data-cy="settings-header"]')).toContainText('Settings');
    await expect(mainWindow.locator('[data-cy="settings-tabs"]')).toBeVisible();
  });

  test('should change theme from light to dark', async () => {
    await test.step('Navigate to appearance settings', async () => {
      await mainWindow.click('[data-cy="settings-tab-appearance"]');
      await expect(mainWindow.locator('[data-cy="appearance-settings"]')).toBeVisible();
    });

    await test.step('Toggle theme', async () => {
      const htmlElement = await mainWindow.locator('html');
      const initialTheme = await htmlElement.getAttribute('class');

      await mainWindow.click('[data-cy="theme-toggle"]');
      await mainWindow.waitForTimeout(500); // Wait for theme transition

      const newTheme = await htmlElement.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);
      expect(newTheme).toContain('dark');
    });

    await test.step('Verify theme persists', async () => {
      // Navigate away and back
      await mainWindow.click('[data-cy="nav-overview"]');
      await mainWindow.click('[data-cy="nav-settings"]');

      const htmlElement = await mainWindow.locator('html');
      const theme = await htmlElement.getAttribute('class');
      expect(theme).toContain('dark');
    });
  });

  test('should configure data refresh intervals', async () => {
    await test.step('Navigate to data settings', async () => {
      await mainWindow.click('[data-cy="settings-tab-data"]');
      await expect(mainWindow.locator('[data-cy="data-settings"]')).toBeVisible();
    });

    await test.step('Update refresh intervals', async () => {
      // Set auto-refresh interval
      await mainWindow.selectOption('[data-cy="refresh-interval"]', '30');
      await expect(mainWindow.locator('[data-cy="refresh-interval"]')).toHaveValue('30');

      // Set cache timeout
      await mainWindow.fill('[data-cy="cache-timeout"]', '3600');
      await expect(mainWindow.locator('[data-cy="cache-timeout"]')).toHaveValue('3600');

      // Enable auto-refresh
      await mainWindow.check('[data-cy="auto-refresh-enabled"]');
      await expect(mainWindow.locator('[data-cy="auto-refresh-enabled"]')).toBeChecked();
    });

    await test.step('Save settings', async () => {
      await mainWindow.click('[data-cy="save-settings-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Settings saved successfully');
    });
  });

  test('should configure PowerShell execution settings', async () => {
    await test.step('Navigate to PowerShell settings', async () => {
      await mainWindow.click('[data-cy="settings-tab-powershell"]');
      await expect(mainWindow.locator('[data-cy="powershell-settings"]')).toBeVisible();
    });

    await test.step('Configure execution policy', async () => {
      await mainWindow.selectOption('[data-cy="execution-policy"]', 'RemoteSigned');
      await expect(mainWindow.locator('[data-cy="execution-policy"]')).toHaveValue('RemoteSigned');
    });

    await test.step('Configure script timeout', async () => {
      await mainWindow.fill('[data-cy="script-timeout"]', '300');
      await expect(mainWindow.locator('[data-cy="script-timeout"]')).toHaveValue('300');
    });

    await test.step('Configure parallel execution', async () => {
      await mainWindow.fill('[data-cy="max-parallel-scripts"]', '5');
      await expect(mainWindow.locator('[data-cy="max-parallel-scripts"]')).toHaveValue('5');
    });

    await test.step('Save settings', async () => {
      await mainWindow.click('[data-cy="save-settings-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Settings saved successfully');
    });
  });

  test('should configure notification preferences', async () => {
    await test.step('Navigate to notification settings', async () => {
      await mainWindow.click('[data-cy="settings-tab-notifications"]');
      await expect(mainWindow.locator('[data-cy="notification-settings"]')).toBeVisible();
    });

    await test.step('Configure notification types', async () => {
      // Enable success notifications
      await mainWindow.check('[data-cy="notify-success"]');
      await expect(mainWindow.locator('[data-cy="notify-success"]')).toBeChecked();

      // Enable error notifications
      await mainWindow.check('[data-cy="notify-errors"]');
      await expect(mainWindow.locator('[data-cy="notify-errors"]')).toBeChecked();

      // Disable info notifications
      await mainWindow.uncheck('[data-cy="notify-info"]');
      await expect(mainWindow.locator('[data-cy="notify-info"]')).not.toBeChecked();
    });

    await test.step('Configure notification duration', async () => {
      await mainWindow.fill('[data-cy="notification-duration"]', '5000');
      await expect(mainWindow.locator('[data-cy="notification-duration"]')).toHaveValue('5000');
    });

    await test.step('Configure notification position', async () => {
      await mainWindow.selectOption('[data-cy="notification-position"]', 'top-right');
      await expect(mainWindow.locator('[data-cy="notification-position"]')).toHaveValue('top-right');
    });

    await test.step('Save settings', async () => {
      await mainWindow.click('[data-cy="save-settings-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Settings saved successfully');
    });
  });

  test('should configure logging settings', async () => {
    await test.step('Navigate to logging settings', async () => {
      await mainWindow.click('[data-cy="settings-tab-logging"]');
      await expect(mainWindow.locator('[data-cy="logging-settings"]')).toBeVisible();
    });

    await test.step('Configure log level', async () => {
      await mainWindow.selectOption('[data-cy="log-level"]', 'debug');
      await expect(mainWindow.locator('[data-cy="log-level"]')).toHaveValue('debug');
    });

    await test.step('Configure log retention', async () => {
      await mainWindow.fill('[data-cy="log-retention-days"]', '30');
      await expect(mainWindow.locator('[data-cy="log-retention-days"]')).toHaveValue('30');
    });

    await test.step('Configure log file size', async () => {
      await mainWindow.fill('[data-cy="max-log-size-mb"]', '100');
      await expect(mainWindow.locator('[data-cy="max-log-size-mb"]')).toHaveValue('100');
    });

    await test.step('Enable performance logging', async () => {
      await mainWindow.check('[data-cy="enable-performance-logging"]');
      await expect(mainWindow.locator('[data-cy="enable-performance-logging"]')).toBeChecked();
    });

    await test.step('Save settings', async () => {
      await mainWindow.click('[data-cy="save-settings-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Settings saved successfully');
    });
  });

  test('should export settings configuration', async () => {
    await test.step('Click export settings', async () => {
      await mainWindow.click('[data-cy="export-settings-btn"]');
      await expect(mainWindow.locator('[data-cy="export-dialog"]')).toBeVisible();
    });

    await test.step('Select export location', async () => {
      await mainWindow.fill('[data-cy="export-path"]', './test-settings-export.json');
      await mainWindow.click('[data-cy="confirm-export-btn"]');
    });

    await test.step('Verify export success', async () => {
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Settings exported successfully');
    });
  });

  test('should import settings configuration', async () => {
    await test.step('Click import settings', async () => {
      await mainWindow.click('[data-cy="import-settings-btn"]');
      await expect(mainWindow.locator('[data-cy="import-dialog"]')).toBeVisible();
    });

    await test.step('Select import file', async () => {
      await mainWindow.fill('[data-cy="import-path"]', './test-settings-import.json');
      await mainWindow.click('[data-cy="confirm-import-btn"]');
    });

    await test.step('Verify import success', async () => {
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Settings imported successfully');
    });
  });

  test('should reset settings to defaults', async () => {
    await test.step('Open reset confirmation', async () => {
      await mainWindow.click('[data-cy="reset-settings-btn"]');
      await expect(mainWindow.locator('[data-cy="confirm-dialog"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="confirm-message"]')).toContainText('reset all settings to default');
    });

    await test.step('Confirm reset', async () => {
      await mainWindow.click('[data-cy="confirm-reset-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Settings reset to defaults');
    });

    await test.step('Verify settings reset', async () => {
      // Check theme is back to light
      const htmlElement = await mainWindow.locator('html');
      const theme = await htmlElement.getAttribute('class');
      expect(theme).not.toContain('dark');

      // Check log level is back to default
      await mainWindow.click('[data-cy="settings-tab-logging"]');
      await expect(mainWindow.locator('[data-cy="log-level"]')).toHaveValue('info');
    });
  });

  test('should validate settings before saving', async () => {
    await test.step('Navigate to data settings', async () => {
      await mainWindow.click('[data-cy="settings-tab-data"]');
    });

    await test.step('Enter invalid values', async () => {
      // Set invalid cache timeout (negative value)
      await mainWindow.fill('[data-cy="cache-timeout"]', '-1');

      // Set invalid refresh interval (too small)
      await mainWindow.fill('[data-cy="refresh-interval"]', '0');
    });

    await test.step('Attempt to save', async () => {
      await mainWindow.click('[data-cy="save-settings-btn"]');
      await expect(mainWindow.locator('[data-cy="validation-error"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="validation-error"]')).toContainText('Invalid settings');
    });

    await test.step('Fix validation errors', async () => {
      await mainWindow.fill('[data-cy="cache-timeout"]', '3600');
      await mainWindow.selectOption('[data-cy="refresh-interval"]', '30');
      await mainWindow.click('[data-cy="save-settings-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Settings saved successfully');
    });
  });

  test('should show settings search functionality', async () => {
    await test.step('Search for theme settings', async () => {
      await mainWindow.fill('[data-cy="settings-search"]', 'theme');
      await mainWindow.waitForTimeout(300); // Debounce delay
    });

    await test.step('Verify search results', async () => {
      // Should automatically navigate to appearance tab
      await expect(mainWindow.locator('[data-cy="appearance-settings"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="theme-toggle"]')).toBeVisible();
    });

    await test.step('Clear search', async () => {
      await mainWindow.click('[data-cy="clear-search-btn"]');
      await expect(mainWindow.locator('[data-cy="settings-search"]')).toHaveValue('');
    });

    await test.step('Search for logging', async () => {
      await mainWindow.fill('[data-cy="settings-search"]', 'log');
      await mainWindow.waitForTimeout(300);
      await expect(mainWindow.locator('[data-cy="logging-settings"]')).toBeVisible();
    });
  });
});