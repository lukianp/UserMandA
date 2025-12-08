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

test.describe('Admin Views', () => {
  test('should manage users in User Management view', async () => {
    await test.step('Navigate to User Management', async () => {
      await mainWindow.click('[data-cy="nav-admin"]');
      await mainWindow.click('[data-cy="nav-user-management"]');
      await expect(mainWindow.locator('[data-cy="user-management-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('View users list', async () => {
      await expect(mainWindow.locator('[data-cy="users-grid"]')).toBeVisible();
      const userRows = await mainWindow.locator('[data-cy="user-row"]').count();
      expect(userRows).toBeGreaterThan(0);
    });

    await test.step('Create new user', async () => {
      await mainWindow.click('[data-cy="create-user-btn"]');
      await expect(mainWindow.locator('[data-cy="create-user-dialog"]')).toBeVisible();

      await mainWindow.fill('[data-cy="user-email"]', 'newuser@example.com');
      await mainWindow.fill('[data-cy="user-firstname"]', 'John');
      await mainWindow.fill('[data-cy="user-lastname"]', 'Doe');
      await mainWindow.selectOption('[data-cy="user-role"]', 'admin');
      await mainWindow.click('[data-cy="save-user-btn"]');

      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('User created successfully');
    });

    await test.step('Edit existing user', async () => {
      await mainWindow.click('[data-cy="user-row-newuser@example.com"]');
      await mainWindow.click('[data-cy="edit-user-btn"]');

      await mainWindow.fill('[data-cy="user-firstname"]', 'Jane');
      await mainWindow.selectOption('[data-cy="user-role"]', 'user');
      await mainWindow.click('[data-cy="save-user-btn"]');

      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('User updated successfully');
    });

    await test.step('Delete user', async () => {
      await mainWindow.click('[data-cy="user-row-newuser@example.com"]');
      await mainWindow.click('[data-cy="delete-user-btn"]');
      await expect(mainWindow.locator('[data-cy="confirm-dialog"]')).toBeVisible();

      await mainWindow.click('[data-cy="confirm-delete-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('User deleted successfully');
    });

    await test.step('Bulk operations', async () => {
      await mainWindow.check('[data-cy="select-all-users"]');
      await mainWindow.click('[data-cy="bulk-actions-btn"]');
      await mainWindow.click('[data-cy="bulk-disable-btn"]');

      await expect(mainWindow.locator('[data-cy="confirm-dialog"]')).toBeVisible();
      await mainWindow.click('[data-cy="cancel-btn"]'); // Cancel for safety
    });
  });

  test('should manage roles in Role Management view', async () => {
    await test.step('Navigate to Role Management', async () => {
      await mainWindow.click('[data-cy="nav-admin"]');
      await mainWindow.click('[data-cy="nav-role-management"]');
      await expect(mainWindow.locator('[data-cy="role-management-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('View roles list', async () => {
      await expect(mainWindow.locator('[data-cy="roles-grid"]')).toBeVisible();
      const defaultRoles = ['Admin', 'User', 'Viewer'];

      for (const role of defaultRoles) {
        await expect(mainWindow.locator(`[data-cy="role-${role}"]`)).toBeVisible();
      }
    });

    await test.step('Create custom role', async () => {
      await mainWindow.click('[data-cy="create-role-btn"]');
      await expect(mainWindow.locator('[data-cy="create-role-dialog"]')).toBeVisible();

      await mainWindow.fill('[data-cy="role-name"]', 'Migration Specialist');
      await mainWindow.fill('[data-cy="role-description"]', 'Can perform migration operations');
      await mainWindow.click('[data-cy="save-role-btn"]');

      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Role created successfully');
    });

    await test.step('Assign permissions to role', async () => {
      await mainWindow.click('[data-cy="role-Migration Specialist"]');
      await mainWindow.click('[data-cy="edit-permissions-btn"]');

      await mainWindow.check('[data-cy="permission-migration.view"]');
      await mainWindow.check('[data-cy="permission-migration.execute"]');
      await mainWindow.check('[data-cy="permission-users.view"]');
      await mainWindow.uncheck('[data-cy="permission-users.delete"]');

      await mainWindow.click('[data-cy="save-permissions-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Permissions updated');
    });

    await test.step('View role members', async () => {
      await mainWindow.click('[data-cy="role-Admin"]');
      await mainWindow.click('[data-cy="view-members-btn"]');

      await expect(mainWindow.locator('[data-cy="role-members-dialog"]')).toBeVisible();
      const members = await mainWindow.locator('[data-cy="member-row"]').count();
      expect(members).toBeGreaterThanOrEqual(0);
    });
  });

  test('should display Permissions view with matrix', async () => {
    await test.step('Navigate to Permissions', async () => {
      await mainWindow.click('[data-cy="nav-admin"]');
      await mainWindow.click('[data-cy="nav-permissions"]');
      await expect(mainWindow.locator('[data-cy="permissions-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('View permission matrix', async () => {
      await expect(mainWindow.locator('[data-cy="permissions-matrix"]')).toBeVisible();

      // Verify matrix headers
      await expect(mainWindow.locator('[data-cy="matrix-header-roles"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="matrix-header-resources"]')).toBeVisible();
    });

    await test.step('Filter permissions by resource', async () => {
      await mainWindow.selectOption('[data-cy="filter-resource"]', 'migration');
      await mainWindow.waitForTimeout(500);

      const visibleRows = await mainWindow.locator('[data-cy="permission-row"]:visible').count();
      expect(visibleRows).toBeGreaterThan(0);
    });

    await test.step('Toggle permission in matrix', async () => {
      // Find a specific cell and toggle it
      const cell = await mainWindow.locator('[data-cy="permission-cell-User-migration.view"]');
      const initialState = await cell.isChecked();

      await cell.click();
      await mainWindow.waitForTimeout(300);

      const newState = await cell.isChecked();
      expect(newState).toBe(!initialState);
    });

    await test.step('Export permissions matrix', async () => {
      await mainWindow.click('[data-cy="export-permissions-btn"]');
      await mainWindow.selectOption('[data-cy="export-format"]', 'csv');
      await mainWindow.click('[data-cy="download-btn"]');

      await expect(mainWindow.locator('[data-cy="export-success"]')).toBeVisible();
    });
  });

  test('should display Audit Log with entries and filters', async () => {
    await test.step('Navigate to Audit Log', async () => {
      await mainWindow.click('[data-cy="nav-admin"]');
      await mainWindow.click('[data-cy="nav-audit-log"]');
      await expect(mainWindow.locator('[data-cy="audit-log-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('View audit log entries', async () => {
      await expect(mainWindow.locator('[data-cy="audit-log-grid"]')).toBeVisible();
      const logEntries = await mainWindow.locator('[data-cy="log-entry"]').count();
      expect(logEntries).toBeGreaterThan(0);
    });

    await test.step('Filter by date range', async () => {
      await mainWindow.fill('[data-cy="date-from"]', '2025-01-01');
      await mainWindow.fill('[data-cy="date-to"]', '2025-12-31');
      await mainWindow.click('[data-cy="apply-date-filter"]');

      await mainWindow.waitForTimeout(500);
      const filteredEntries = await mainWindow.locator('[data-cy="log-entry"]').count();
      expect(filteredEntries).toBeGreaterThanOrEqual(0);
    });

    await test.step('Filter by action type', async () => {
      await mainWindow.selectOption('[data-cy="filter-action"]', 'USER_CREATED');
      await mainWindow.waitForTimeout(500);

      const actionEntries = await mainWindow.locator('[data-cy="log-entry"]').all();
      for (const entry of actionEntries) {
        const action = await entry.locator('[data-cy="log-action"]').textContent();
        expect(action).toContain('USER_CREATED');
      }
    });

    await test.step('Filter by user', async () => {
      await mainWindow.fill('[data-cy="filter-user"]', 'admin@example.com');
      await mainWindow.click('[data-cy="apply-user-filter"]');
      await mainWindow.waitForTimeout(500);
    });

    await test.step('View log entry details', async () => {
      await mainWindow.click('[data-cy="log-entry"]:first-child');
      await expect(mainWindow.locator('[data-cy="log-details-panel"]')).toBeVisible();

      await expect(mainWindow.locator('[data-cy="detail-timestamp"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="detail-user"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="detail-action"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="detail-resource"]')).toBeVisible();
    });

    await test.step('Export audit log', async () => {
      await mainWindow.click('[data-cy="export-log-btn"]');
      await mainWindow.selectOption('[data-cy="export-format"]', 'json');
      await mainWindow.click('[data-cy="download-btn"]');

      await expect(mainWindow.locator('[data-cy="export-success"]')).toBeVisible();
    });
  });

  test('should manage System Configuration settings', async () => {
    await test.step('Navigate to System Configuration', async () => {
      await mainWindow.click('[data-cy="nav-admin"]');
      await mainWindow.click('[data-cy="nav-system-config"]');
      await expect(mainWindow.locator('[data-cy="system-config-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Configure system parameters', async () => {
      await mainWindow.fill('[data-cy="config-max-users"]', '10000');
      await mainWindow.fill('[data-cy="config-session-timeout"]', '30');
      await mainWindow.selectOption('[data-cy="config-auth-provider"]', 'azure-ad');
      await mainWindow.check('[data-cy="config-enable-2fa"]');
    });

    await test.step('Configure email settings', async () => {
      await mainWindow.click('[data-cy="tab-email-config"]');
      await mainWindow.fill('[data-cy="smtp-server"]', 'smtp.example.com');
      await mainWindow.fill('[data-cy="smtp-port"]', '587');
      await mainWindow.fill('[data-cy="smtp-username"]', 'notifications@example.com');
      await mainWindow.fill('[data-cy="smtp-password"]', 'password123');
      await mainWindow.check('[data-cy="smtp-use-tls"]');
    });

    await test.step('Test email configuration', async () => {
      await mainWindow.click('[data-cy="test-email-btn"]');
      await mainWindow.fill('[data-cy="test-email-to"]', 'test@example.com');
      await mainWindow.click('[data-cy="send-test-btn"]');

      await expect(mainWindow.locator('[data-cy="test-result"]')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Save configuration', async () => {
      await mainWindow.click('[data-cy="save-config-btn"]');
      await expect(mainWindow.locator('[data-cy="success-message"]')).toContainText('Configuration saved');
    });
  });

  test('should perform Backup and Restore operations', async () => {
    await test.step('Navigate to Backup/Restore', async () => {
      await mainWindow.click('[data-cy="nav-admin"]');
      await mainWindow.click('[data-cy="nav-backup-restore"]');
      await expect(mainWindow.locator('[data-cy="backup-restore-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('View backup history', async () => {
      await expect(mainWindow.locator('[data-cy="backup-history-grid"]')).toBeVisible();
      const backups = await mainWindow.locator('[data-cy="backup-row"]').count();
      expect(backups).toBeGreaterThanOrEqual(0);
    });

    await test.step('Create new backup', async () => {
      await mainWindow.click('[data-cy="create-backup-btn"]');
      await expect(mainWindow.locator('[data-cy="backup-dialog"]')).toBeVisible();

      await mainWindow.fill('[data-cy="backup-name"]', 'Test Backup');
      await mainWindow.fill('[data-cy="backup-description"]', 'E2E test backup');
      await mainWindow.check('[data-cy="include-users"]');
      await mainWindow.check('[data-cy="include-settings"]');
      await mainWindow.check('[data-cy="include-profiles"]');

      await mainWindow.click('[data-cy="start-backup-btn"]');
      await expect(mainWindow.locator('[data-cy="backup-progress"]')).toBeVisible();

      // Wait for backup to complete (max 30 seconds)
      await expect(mainWindow.locator('[data-cy="backup-complete"]')).toBeVisible({ timeout: 30000 });
    });

    await test.step('Download backup', async () => {
      await mainWindow.click('[data-cy="backup-row-Test Backup"]');
      await mainWindow.click('[data-cy="download-backup-btn"]');

      await expect(mainWindow.locator('[data-cy="download-started"]')).toBeVisible();
    });

    await test.step('Restore from backup', async () => {
      await mainWindow.click('[data-cy="backup-row-Test Backup"]');
      await mainWindow.click('[data-cy="restore-btn"]');

      await expect(mainWindow.locator('[data-cy="restore-dialog"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="restore-warning"]')).toContainText('This will overwrite');

      await mainWindow.check('[data-cy="restore-users"]');
      await mainWindow.check('[data-cy="restore-settings"]');

      // Cancel for safety in test
      await mainWindow.click('[data-cy="cancel-restore-btn"]');
    });

    await test.step('Schedule automatic backup', async () => {
      await mainWindow.click('[data-cy="schedule-backup-btn"]');
      await mainWindow.selectOption('[data-cy="backup-frequency"]', 'daily');
      await mainWindow.fill('[data-cy="backup-time"]', '02:00');
      await mainWindow.fill('[data-cy="backup-retention"]', '30');

      await mainWindow.click('[data-cy="save-schedule-btn"]');
      await expect(mainWindow.locator('[data-cy="schedule-saved"]')).toBeVisible();
    });
  });

  test('should display License Activation information', async () => {
    await test.step('Navigate to License Activation', async () => {
      await mainWindow.click('[data-cy="nav-admin"]');
      await mainWindow.click('[data-cy="nav-license"]');
      await expect(mainWindow.locator('[data-cy="license-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('View current license', async () => {
      await expect(mainWindow.locator('[data-cy="license-status"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="license-type"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="license-expiry"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="licensed-users"]')).toBeVisible();
    });

    await test.step('Enter license key', async () => {
      await mainWindow.click('[data-cy="activate-license-btn"]');
      await expect(mainWindow.locator('[data-cy="license-dialog"]')).toBeVisible();

      await mainWindow.fill('[data-cy="license-key"]', 'TEST-LICENSE-KEY-12345');
      await mainWindow.click('[data-cy="validate-key-btn"]');

      // Wait for validation
      await mainWindow.waitForTimeout(1000);
      await expect(mainWindow.locator('[data-cy="validation-result"]')).toBeVisible();
    });

    await test.step('View feature availability', async () => {
      await mainWindow.click('[data-cy="tab-features"]');
      await expect(mainWindow.locator('[data-cy="features-list"]')).toBeVisible();

      const features = ['User Migration', 'Group Migration', 'Advanced Reports', 'API Access'];
      for (const feature of features) {
        const featureRow = await mainWindow.locator(`[data-cy="feature-${feature}"]`);
        await expect(featureRow).toBeVisible();
      }
    });

    await test.step('Request license upgrade', async () => {
      await mainWindow.click('[data-cy="upgrade-license-btn"]');
      await expect(mainWindow.locator('[data-cy="upgrade-dialog"]')).toBeVisible();

      await mainWindow.selectOption('[data-cy="license-tier"]', 'enterprise');
      await mainWindow.fill('[data-cy="required-users"]', '5000');
      await mainWindow.fill('[data-cy="contact-email"]', 'admin@company.com');

      await mainWindow.click('[data-cy="submit-request-btn"]');
      await expect(mainWindow.locator('[data-cy="request-sent"]')).toBeVisible();
    });
  });

  test('should display About view with app details', async () => {
    await test.step('Navigate to About', async () => {
      await mainWindow.click('[data-cy="nav-admin"]');
      await mainWindow.click('[data-cy="nav-about"]');
      await expect(mainWindow.locator('[data-cy="about-view"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('View application information', async () => {
      await expect(mainWindow.locator('[data-cy="app-name"]')).toContainText('M&A Discovery Suite');
      await expect(mainWindow.locator('[data-cy="app-version"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="app-build"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="app-copyright"]')).toBeVisible();
    });

    await test.step('View system information', async () => {
      await mainWindow.click('[data-cy="tab-system-info"]');
      await expect(mainWindow.locator('[data-cy="os-info"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="node-version"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="electron-version"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="chrome-version"]')).toBeVisible();
    });

    await test.step('View dependencies', async () => {
      await mainWindow.click('[data-cy="tab-dependencies"]');
      await expect(mainWindow.locator('[data-cy="dependencies-list"]')).toBeVisible();

      const coreDeps = ['react', 'electron', 'typescript', 'ag-grid'];
      for (const dep of coreDeps) {
        await expect(mainWindow.locator(`[data-cy="dep-${dep}"]`)).toBeVisible();
      }
    });

    await test.step('Check for updates', async () => {
      await mainWindow.click('[data-cy="check-updates-btn"]');
      await expect(mainWindow.locator('[data-cy="checking-updates"]')).toBeVisible();

      // Wait for update check
      await mainWindow.waitForSelector('[data-cy="update-result"]', { timeout: 10000 });
      const updateResult = await mainWindow.locator('[data-cy="update-result"]').textContent();
      expect(['Up to date', 'Update available']).toContain(updateResult);
    });

    await test.step('View license agreement', async () => {
      await mainWindow.click('[data-cy="view-license-btn"]');
      await expect(mainWindow.locator('[data-cy="license-dialog"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="license-text"]')).toContainText('LICENSE');
      await mainWindow.click('[data-cy="close-license-btn"]');
    });
  });
});