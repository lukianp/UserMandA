import { test, expect, _electron as electron } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

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

test.describe('Profile Management', () => {
  test('should create a new profile', async () => {
    await test.step('Navigate to profile section', async () => {
      await mainWindow.click('[data-cy="profile-selector"]');
      await mainWindow.waitForSelector('[data-cy="profile-dropdown"]', { state: 'visible' });
    });

    await test.step('Click create profile button', async () => {
      await mainWindow.click('[data-cy="create-profile-btn"]');
      await expect(mainWindow.locator('[data-cy="profile-dialog"]')).toBeVisible();
    });

    await test.step('Fill in profile details', async () => {
      await mainWindow.fill('[data-cy="profile-name"]', 'Test Profile');
      await mainWindow.fill('[data-cy="profile-tenant-id"]', '12345678-1234-1234-1234-123456789012');
      await mainWindow.fill('[data-cy="profile-client-id"]', 'test-client-id');
      await mainWindow.fill('[data-cy="profile-client-secret"]', 'test-secret');
      await mainWindow.selectOption('[data-cy="profile-environment"]', 'AzureAD');
    });

    await test.step('Save profile', async () => {
      await mainWindow.click('[data-cy="save-profile-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Profile created successfully');
    });

    await test.step('Verify profile appears in list', async () => {
      await mainWindow.click('[data-cy="profile-selector"]');
      await expect(mainWindow.locator('[data-cy="profile-option-Test Profile"]')).toBeVisible();
    });
  });

  test('should edit an existing profile', async () => {
    await test.step('Select profile to edit', async () => {
      await mainWindow.click('[data-cy="profile-selector"]');
      await mainWindow.click('[data-cy="profile-option-Test Profile"]');
    });

    await test.step('Open edit dialog', async () => {
      await mainWindow.click('[data-cy="edit-profile-btn"]');
      await expect(mainWindow.locator('[data-cy="profile-dialog"]')).toBeVisible();
    });

    await test.step('Modify profile details', async () => {
      await mainWindow.fill('[data-cy="profile-name"]', 'Updated Test Profile');
      await mainWindow.selectOption('[data-cy="profile-environment"]', 'Exchange');
    });

    await test.step('Save changes', async () => {
      await mainWindow.click('[data-cy="save-profile-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Profile updated successfully');
    });
  });

  test('should test profile connection', async () => {
    await test.step('Select profile', async () => {
      await mainWindow.click('[data-cy="profile-selector"]');
      await mainWindow.click('[data-cy="profile-option-Updated Test Profile"]');
    });

    await test.step('Test connection', async () => {
      await mainWindow.click('[data-cy="test-connection-btn"]');
      await expect(mainWindow.locator('[data-cy="connection-testing"]')).toBeVisible();
    });

    await test.step('Verify connection result', async () => {
      // Wait for connection test to complete (max 30 seconds)
      await mainWindow.waitForSelector('[data-cy="connection-result"]', { timeout: 30000 });
      const result = await mainWindow.locator('[data-cy="connection-result"]').textContent();
      expect(['Connected', 'Connection Failed']).toContain(result);
    });
  });

  test('should delete a profile', async () => {
    await test.step('Select profile to delete', async () => {
      await mainWindow.click('[data-cy="profile-selector"]');
      await mainWindow.click('[data-cy="profile-option-Updated Test Profile"]');
    });

    await test.step('Click delete button', async () => {
      await mainWindow.click('[data-cy="delete-profile-btn"]');
      await expect(mainWindow.locator('[data-cy="confirm-dialog"]')).toBeVisible();
    });

    await test.step('Confirm deletion', async () => {
      await mainWindow.click('[data-cy="confirm-delete-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Profile deleted successfully');
    });

    await test.step('Verify profile removed from list', async () => {
      await mainWindow.click('[data-cy="profile-selector"]');
      await expect(mainWindow.locator('[data-cy="profile-option-Updated Test Profile"]')).not.toBeVisible();
    });
  });

  test('should handle invalid profile credentials', async () => {
    await test.step('Create profile with invalid credentials', async () => {
      await mainWindow.click('[data-cy="create-profile-btn"]');
      await mainWindow.fill('[data-cy="profile-name"]', 'Invalid Profile');
      await mainWindow.fill('[data-cy="profile-tenant-id"]', 'invalid-tenant');
      await mainWindow.fill('[data-cy="profile-client-id"]', '');
      await mainWindow.fill('[data-cy="profile-client-secret"]', '');
    });

    await test.step('Attempt to save', async () => {
      await mainWindow.click('[data-cy="save-profile-btn"]');
      await expect(mainWindow.locator('[data-cy="validation-error"]')).toContainText('Client ID is required');
    });
  });

  test('should switch between profiles', async () => {
    await test.step('Create first profile', async () => {
      await mainWindow.click('[data-cy="create-profile-btn"]');
      await mainWindow.fill('[data-cy="profile-name"]', 'Source Profile');
      await mainWindow.fill('[data-cy="profile-tenant-id"]', 'source-tenant-id');
      await mainWindow.fill('[data-cy="profile-client-id"]', 'source-client');
      await mainWindow.fill('[data-cy="profile-client-secret"]', 'source-secret');
      await mainWindow.click('[data-cy="save-profile-btn"]');
    });

    await test.step('Create second profile', async () => {
      await mainWindow.click('[data-cy="create-profile-btn"]');
      await mainWindow.fill('[data-cy="profile-name"]', 'Target Profile');
      await mainWindow.fill('[data-cy="profile-tenant-id"]', 'target-tenant-id');
      await mainWindow.fill('[data-cy="profile-client-id"]', 'target-client');
      await mainWindow.fill('[data-cy="profile-client-secret"]', 'target-secret');
      await mainWindow.click('[data-cy="save-profile-btn"]');
    });

    await test.step('Switch between profiles', async () => {
      // Select source profile
      await mainWindow.click('[data-cy="profile-selector"]');
      await mainWindow.click('[data-cy="profile-option-Source Profile"]');
      await expect(mainWindow.locator('[data-cy="selected-profile"]')).toContainText('Source Profile');

      // Switch to target profile
      await mainWindow.click('[data-cy="profile-selector"]');
      await mainWindow.click('[data-cy="profile-option-Target Profile"]');
      await expect(mainWindow.locator('[data-cy="selected-profile"]')).toContainText('Target Profile');
    });
  });

  test('should export profile configuration', async () => {
    await test.step('Select profile to export', async () => {
      await mainWindow.click('[data-cy="profile-selector"]');
      await mainWindow.click('[data-cy="profile-option-Source Profile"]');
    });

    await test.step('Export profile', async () => {
      await mainWindow.click('[data-cy="export-profile-btn"]');
      await expect(mainWindow.locator('[data-cy="export-dialog"]')).toBeVisible();
    });

    await test.step('Choose export location', async () => {
      await mainWindow.fill('[data-cy="export-path"]', './test-profile-export.json');
      await mainWindow.click('[data-cy="confirm-export-btn"]');
    });

    await test.step('Verify export success', async () => {
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Profile exported successfully');

      // Verify file exists
      const exportPath = path.join(__dirname, '../../test-profile-export.json');
      const fileExists = await fs.access(exportPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });
  });

  test('should import profile configuration', async () => {
    const testProfileData = {
      name: 'Imported Profile',
      tenantId: 'import-tenant-id',
      clientId: 'import-client-id',
      clientSecret: 'import-secret',
      environment: 'AzureAD',
    };

    await test.step('Create import file', async () => {
      const importPath = path.join(__dirname, '../../test-profile-import.json');
      await fs.writeFile(importPath, JSON.stringify(testProfileData, null, 2));
    });

    await test.step('Open import dialog', async () => {
      await mainWindow.click('[data-cy="import-profile-btn"]');
      await expect(mainWindow.locator('[data-cy="import-dialog"]')).toBeVisible();
    });

    await test.step('Select file to import', async () => {
      await mainWindow.fill('[data-cy="import-path"]', './test-profile-import.json');
      await mainWindow.click('[data-cy="confirm-import-btn"]');
    });

    await test.step('Verify import success', async () => {
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Profile imported successfully');

      // Verify profile appears in list
      await mainWindow.click('[data-cy="profile-selector"]');
      await expect(mainWindow.locator('[data-cy="profile-option-Imported Profile"]')).toBeVisible();
    });
  });
});