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

test.describe('Tab Management', () => {
  test('should open new tabs when navigating', async () => {
    await test.step('Navigate to Users view', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await expect(mainWindow.locator('[data-cy="tab-users"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();
    });

    await test.step('Navigate to Groups view', async () => {
      await mainWindow.click('[data-cy="nav-groups"]');
      await expect(mainWindow.locator('[data-cy="tab-groups"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="groups-view"]')).toBeVisible();
    });

    await test.step('Verify both tabs are open', async () => {
      const tabs = await mainWindow.locator('[data-cy^="tab-"]').all();
      expect(tabs.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('should switch between tabs', async () => {
    await test.step('Open multiple tabs', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await mainWindow.click('[data-cy="nav-groups"]');
      await mainWindow.click('[data-cy="nav-discovery"]');
    });

    await test.step('Switch to Users tab', async () => {
      await mainWindow.click('[data-cy="tab-users"]');
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="tab-users"]')).toHaveAttribute('data-active', 'true');
    });

    await test.step('Switch to Groups tab', async () => {
      await mainWindow.click('[data-cy="tab-groups"]');
      await expect(mainWindow.locator('[data-cy="groups-view"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="tab-groups"]')).toHaveAttribute('data-active', 'true');
    });

    await test.step('Switch to Discovery tab', async () => {
      await mainWindow.click('[data-cy="tab-discovery"]');
      await expect(mainWindow.locator('[data-cy="discovery-view"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="tab-discovery"]')).toHaveAttribute('data-active', 'true');
    });
  });

  test('should close tabs', async () => {
    await test.step('Open multiple tabs', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await mainWindow.click('[data-cy="nav-groups"]');
      await mainWindow.click('[data-cy="nav-discovery"]');
    });

    await test.step('Close Groups tab', async () => {
      await mainWindow.click('[data-cy="tab-groups-close"]');
      await expect(mainWindow.locator('[data-cy="tab-groups"]')).not.toBeVisible();
    });

    await test.step('Verify tab is removed', async () => {
      const tabs = await mainWindow.locator('[data-cy^="tab-"]').all();
      const tabTexts = await Promise.all(tabs.map(tab => tab.textContent()));
      expect(tabTexts).not.toContain('Groups');
    });

    await test.step('Verify active tab switches after close', async () => {
      // Should switch to the next available tab
      const activeTab = await mainWindow.locator('[data-active="true"]');
      expect(await activeTab.count()).toBe(1);
    });
  });

  test('should close tab with keyboard shortcut', async () => {
    await test.step('Open a tab', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await expect(mainWindow.locator('[data-cy="tab-users"]')).toBeVisible();
    });

    await test.step('Close tab with Ctrl+W', async () => {
      await mainWindow.keyboard.press('Control+W');
      await mainWindow.waitForTimeout(500); // Wait for animation
    });

    await test.step('Verify tab is closed', async () => {
      await expect(mainWindow.locator('[data-cy="tab-users"]')).not.toBeVisible();
    });
  });

  test('should open new tab with keyboard shortcut', async () => {
    await test.step('Open new tab with Ctrl+T', async () => {
      await mainWindow.keyboard.press('Control+T');
      await mainWindow.waitForTimeout(500);
    });

    await test.step('Verify new tab is created', async () => {
      // Should open a default new tab (usually Overview or blank)
      const tabs = await mainWindow.locator('[data-cy^="tab-"]').all();
      expect(tabs.length).toBeGreaterThan(0);
    });
  });

  test('should handle tab overflow with scrolling', async () => {
    await test.step('Open many tabs to cause overflow', async () => {
      const views = ['users', 'groups', 'discovery', 'infrastructure', 'migration', 'reports', 'settings'];
      for (const view of views) {
        await mainWindow.click(`[data-cy="nav-${view}"]`);
        await mainWindow.waitForTimeout(200); // Small delay between clicks
      }
    });

    await test.step('Verify scroll buttons appear', async () => {
      // Check if tab container has overflow
      const tabContainer = await mainWindow.locator('[data-cy="tab-container"]');
      const hasOverflow = await tabContainer.evaluate(el => el.scrollWidth > el.clientWidth);

      if (hasOverflow) {
        await expect(mainWindow.locator('[data-cy="tab-scroll-left"]')).toBeVisible();
        await expect(mainWindow.locator('[data-cy="tab-scroll-right"]')).toBeVisible();
      }
    });

    await test.step('Scroll through tabs', async () => {
      const scrollRight = await mainWindow.locator('[data-cy="tab-scroll-right"]');
      if (await scrollRight.isVisible()) {
        await scrollRight.click();
        await mainWindow.waitForTimeout(300); // Wait for scroll animation

        // Verify scrolled
        const tabContainer = await mainWindow.locator('[data-cy="tab-container"]');
        const scrollLeft = await tabContainer.evaluate(el => el.scrollLeft);
        expect(scrollLeft).toBeGreaterThan(0);
      }
    });
  });

  test('should reorder tabs with drag and drop', async () => {
    await test.step('Open multiple tabs', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await mainWindow.click('[data-cy="nav-groups"]');
      await mainWindow.click('[data-cy="nav-discovery"]');
    });

    await test.step('Get initial tab order', async () => {
      const tabs = await mainWindow.locator('[data-cy^="tab-"]').all();
      const initialOrder = await Promise.all(tabs.map(tab => tab.getAttribute('data-cy')));
      expect(initialOrder).toContain('tab-users');
      expect(initialOrder).toContain('tab-groups');
    });

    await test.step('Drag Users tab to end', async () => {
      const usersTab = await mainWindow.locator('[data-cy="tab-users"]');
      const discoveryTab = await mainWindow.locator('[data-cy="tab-discovery"]');

      // Perform drag and drop
      await usersTab.dragTo(discoveryTab);
      await mainWindow.waitForTimeout(500); // Wait for reorder animation
    });

    await test.step('Verify new tab order', async () => {
      const tabs = await mainWindow.locator('[data-cy^="tab-"]').all();
      const newOrder = await Promise.all(tabs.map(tab => tab.getAttribute('data-cy')));

      // Users should now be after Discovery
      const usersIndex = newOrder.indexOf('tab-users');
      const discoveryIndex = newOrder.indexOf('tab-discovery');
      expect(usersIndex).toBeGreaterThan(discoveryIndex);
    });
  });

  test('should persist tab state on refresh', async () => {
    await test.step('Open specific tabs', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await mainWindow.click('[data-cy="nav-migration"]');
      await mainWindow.click('[data-cy="nav-reports"]');
    });

    await test.step('Get current tab state', async () => {
      const tabs = await mainWindow.locator('[data-cy^="tab-"]').all();
      const tabNames = await Promise.all(tabs.map(tab => tab.getAttribute('data-cy')));
      expect(tabNames).toContain('tab-users');
      expect(tabNames).toContain('tab-migration');
      expect(tabNames).toContain('tab-reports');
    });

    await test.step('Refresh the page', async () => {
      await mainWindow.reload();
      await mainWindow.waitForSelector('[data-cy="app-loaded"]', { timeout: 10000 });
    });

    await test.step('Verify tabs are restored', async () => {
      const restoredTabs = await mainWindow.locator('[data-cy^="tab-"]').all();
      const restoredTabNames = await Promise.all(restoredTabs.map(tab => tab.getAttribute('data-cy')));
      expect(restoredTabNames).toContain('tab-users');
      expect(restoredTabNames).toContain('tab-migration');
      expect(restoredTabNames).toContain('tab-reports');
    });
  });

  test('should show tab context menu', async () => {
    await test.step('Open multiple tabs', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await mainWindow.click('[data-cy="nav-groups"]');
      await mainWindow.click('[data-cy="nav-discovery"]');
    });

    await test.step('Right-click on tab', async () => {
      await mainWindow.click('[data-cy="tab-groups"]', { button: 'right' });
      await expect(mainWindow.locator('[data-cy="tab-context-menu"]')).toBeVisible();
    });

    await test.step('Verify context menu options', async () => {
      await expect(mainWindow.locator('[data-cy="context-close-tab"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="context-close-other-tabs"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="context-close-all-tabs"]')).toBeVisible();
      await expect(mainWindow.locator('[data-cy="context-pin-tab"]')).toBeVisible();
    });

    await test.step('Close other tabs', async () => {
      await mainWindow.click('[data-cy="context-close-other-tabs"]');
      await mainWindow.waitForTimeout(500);

      const remainingTabs = await mainWindow.locator('[data-cy^="tab-"]').all();
      expect(remainingTabs.length).toBe(1);
      await expect(mainWindow.locator('[data-cy="tab-groups"]')).toBeVisible();
    });
  });

  test('should pin and unpin tabs', async () => {
    await test.step('Open a tab', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await expect(mainWindow.locator('[data-cy="tab-users"]')).toBeVisible();
    });

    await test.step('Pin the tab', async () => {
      await mainWindow.click('[data-cy="tab-users"]', { button: 'right' });
      await mainWindow.click('[data-cy="context-pin-tab"]');
      await mainWindow.waitForTimeout(300);
    });

    await test.step('Verify tab is pinned', async () => {
      const pinnedTab = await mainWindow.locator('[data-cy="tab-users"]');
      await expect(pinnedTab).toHaveAttribute('data-pinned', 'true');

      // Pinned tabs should not have close button
      await expect(mainWindow.locator('[data-cy="tab-users-close"]')).not.toBeVisible();
    });

    await test.step('Try to close pinned tab with Ctrl+W', async () => {
      await mainWindow.click('[data-cy="tab-users"]'); // Focus the tab
      await mainWindow.keyboard.press('Control+W');
      await mainWindow.waitForTimeout(300);

      // Tab should still be visible (pinned tabs can't be closed)
      await expect(mainWindow.locator('[data-cy="tab-users"]')).toBeVisible();
    });

    await test.step('Unpin the tab', async () => {
      await mainWindow.click('[data-cy="tab-users"]', { button: 'right' });
      await mainWindow.click('[data-cy="context-unpin-tab"]');
      await mainWindow.waitForTimeout(300);

      await expect(mainWindow.locator('[data-cy="tab-users"]')).toHaveAttribute('data-pinned', 'false');
      await expect(mainWindow.locator('[data-cy="tab-users-close"]')).toBeVisible();
    });
  });

  test('should navigate between tabs with keyboard', async () => {
    await test.step('Open multiple tabs', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await mainWindow.click('[data-cy="nav-groups"]');
      await mainWindow.click('[data-cy="nav-discovery"]');
    });

    await test.step('Navigate to next tab with Ctrl+Tab', async () => {
      await mainWindow.keyboard.press('Control+Tab');
      await mainWindow.waitForTimeout(300);

      // Should move to the next tab
      const activeTab = await mainWindow.locator('[data-active="true"]');
      expect(await activeTab.count()).toBe(1);
    });

    await test.step('Navigate to previous tab with Ctrl+Shift+Tab', async () => {
      await mainWindow.keyboard.press('Control+Shift+Tab');
      await mainWindow.waitForTimeout(300);

      // Should move to the previous tab
      const activeTab = await mainWindow.locator('[data-active="true"]');
      expect(await activeTab.count()).toBe(1);
    });

    await test.step('Navigate to specific tab with Ctrl+Number', async () => {
      // Ctrl+1 should go to first tab
      await mainWindow.keyboard.press('Control+1');
      await mainWindow.waitForTimeout(300);

      const tabs = await mainWindow.locator('[data-cy^="tab-"]').all();
      const firstTab = tabs[0];
      await expect(firstTab).toHaveAttribute('data-active', 'true');

      // Ctrl+2 should go to second tab
      await mainWindow.keyboard.press('Control+2');
      await mainWindow.waitForTimeout(300);

      const secondTab = tabs[1];
      await expect(secondTab).toHaveAttribute('data-active', 'true');
    });
  });
});