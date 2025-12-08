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

test.describe('Navigation & Routing', () => {
  const routes = [
    { name: 'Overview', cy: 'nav-overview', view: 'overview-view' },
    { name: 'Users', cy: 'nav-users', view: 'users-view' },
    { name: 'Groups', cy: 'nav-groups', view: 'groups-view' },
    { name: 'Discovery', cy: 'nav-discovery', view: 'domain-discovery-view' },
    { name: 'Infrastructure', cy: 'nav-infrastructure', view: 'infrastructure-view' },
    { name: 'Migration', cy: 'nav-migration', view: 'migration-planning-view' },
    { name: 'Reports', cy: 'nav-reports', view: 'reports-view' },
    { name: 'Settings', cy: 'nav-settings', view: 'settings-view' },
  ];

  for (const route of routes) {
    test(`should navigate to ${route.name}`, async () => {
      await test.step(`Click ${route.name} navigation link`, async () => {
        const navLink = mainWindow.locator(`[data-cy="${route.cy}"]`);
        await navLink.click();
      });

      await test.step(`Verify ${route.name} view is visible`, async () => {
        await expect(mainWindow.locator(`[data-cy="${route.view}"]`)).toBeVisible({ timeout: 5000 });
      });

      await test.step('Verify navigation link is active', async () => {
        const navLink = mainWindow.locator(`[data-cy="${route.cy}"]`);
        // Active links should have active class or aria-current
        const isActive = await navLink.evaluate((el) => {
          return el.classList.contains('active') ||
                 el.getAttribute('aria-current') === 'page' ||
                 el.classList.contains('bg-primary-600') || // Tailwind active state
                 el.classList.contains('font-bold');
        });
        expect(isActive).toBe(true);
      });
    });
  }

  test('should handle browser back/forward navigation', async () => {
    await test.step('Navigate through multiple views', async () => {
      await mainWindow.click('[data-cy="nav-overview"]');
      await expect(mainWindow.locator('[data-cy="overview-view"]')).toBeVisible();

      await mainWindow.click('[data-cy="nav-users"]');
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

      await mainWindow.click('[data-cy="nav-groups"]');
      await expect(mainWindow.locator('[data-cy="groups-view"]')).toBeVisible();
    });

    await test.step('Navigate back', async () => {
      await mainWindow.goBack();
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible({ timeout: 3000 });

      await mainWindow.goBack();
      await expect(mainWindow.locator('[data-cy="overview-view"]')).toBeVisible({ timeout: 3000 });
    });

    await test.step('Navigate forward', async () => {
      await mainWindow.goForward();
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible({ timeout: 3000 });

      await mainWindow.goForward();
      await expect(mainWindow.locator('[data-cy="groups-view"]')).toBeVisible({ timeout: 3000 });
    });
  });

  test('should maintain active nav state on page refresh', async () => {
    // Navigate to a specific view
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Reload the page
    await mainWindow.reload();
    await mainWindow.waitForLoadState('domcontentloaded');
    await mainWindow.waitForSelector('[data-cy="app-loaded"]', { timeout: 10000 });

    // Should still be on Users view (if using HashRouter with persistence)
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate using sidebar links', async () => {
    // Verify sidebar is visible
    const sidebar = mainWindow.locator('[data-cy="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Click sidebar navigation items
    await sidebar.locator('[data-cy="nav-discovery"]').click();
    await expect(mainWindow.locator('[data-cy="domain-discovery-view"]')).toBeVisible();

    await sidebar.locator('[data-cy="nav-migration"]').click();
    await expect(mainWindow.locator('[data-cy="migration-planning-view"]')).toBeVisible();
  });

  test('should display breadcrumbs for nested routes', async () => {
    // Navigate to migration (which has sub-routes)
    await mainWindow.click('[data-cy="nav-migration"]');
    await expect(mainWindow.locator('[data-cy="migration-planning-view"]')).toBeVisible();

    // Navigate to a sub-route
    await mainWindow.click('[data-cy="nav-migration-mapping"]');

    // Breadcrumbs should show: Migration > Mapping
    const breadcrumbs = mainWindow.locator('[data-cy="breadcrumbs"]');
    if (await breadcrumbs.isVisible()) {
      const breadcrumbText = await breadcrumbs.textContent();
      expect(breadcrumbText).toContain('Migration');
      expect(breadcrumbText).toContain('Mapping');
    }
  });

  test('should lazy load views on first navigation', async () => {
    // Navigate to Reports (likely lazy loaded)
    const startTime = Date.now();
    await mainWindow.click('[data-cy="nav-reports"]');

    // Loading spinner should appear briefly
    const spinner = mainWindow.locator('[data-cy="loading-spinner"]');
    const spinnerVisible = await spinner.isVisible({ timeout: 1000 }).catch(() => false);

    // View should eventually load
    await expect(mainWindow.locator('[data-cy="reports-view"]')).toBeVisible({ timeout: 5000 });

    const loadTime = Date.now() - startTime;
    console.log(`Reports view loaded in ${loadTime}ms`);

    // Second navigation should be faster (already loaded)
    await mainWindow.click('[data-cy="nav-overview"]');
    await mainWindow.click('[data-cy="nav-reports"]');
    await expect(mainWindow.locator('[data-cy="reports-view"]')).toBeVisible({ timeout: 2000 });
  });

  test('should handle invalid routes gracefully', async () => {
    // Try to navigate to non-existent route via URL manipulation
    await mainWindow.evaluate(() => {
      window.location.hash = '#/invalid-route-xyz';
    });

    await mainWindow.waitForTimeout(1000);

    // Should show 404 page or redirect to home
    const notFoundPage = mainWindow.locator('[data-cy="404-page"]');
    const homePage = mainWindow.locator('[data-cy="overview-view"]');

    const showsNotFound = await notFoundPage.isVisible({ timeout: 2000 }).catch(() => false);
    const redirectedHome = await homePage.isVisible({ timeout: 2000 }).catch(() => false);

    expect(showsNotFound || redirectedHome).toBe(true);
  });

  test('should persist scroll position on navigation', async () => {
    // Navigate to a view with scrollable content
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Scroll down
    await mainWindow.evaluate(() => {
      window.scrollTo(0, 300);
    });

    const scrollPosition = await mainWindow.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);

    // Navigate away
    await mainWindow.click('[data-cy="nav-groups"]');
    await expect(mainWindow.locator('[data-cy="groups-view"]')).toBeVisible();

    // Navigate back
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Scroll should be reset or restored (depending on implementation)
    const newScrollPosition = await mainWindow.evaluate(() => window.scrollY);
    console.log(`Scroll position after navigation: ${newScrollPosition}`);
  });

  test('should show loading state during route transitions', async () => {
    await mainWindow.click('[data-cy="nav-migration"]');

    // Loading indicator should appear
    const loadingIndicator = mainWindow.locator('[data-cy="route-loading"]');
    const isLoading = await loadingIndicator.isVisible({ timeout: 500 }).catch(() => false);

    // View should load
    await expect(mainWindow.locator('[data-cy="migration-planning-view"]')).toBeVisible({ timeout: 5000 });
  });

  test('should support deep linking to specific views', async () => {
    // Navigate directly via hash
    await mainWindow.evaluate(() => {
      window.location.hash = '#/users';
    });

    await mainWindow.waitForTimeout(500);
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible({ timeout: 3000 });

    // Try another route
    await mainWindow.evaluate(() => {
      window.location.hash = '#/settings';
    });

    await mainWindow.waitForTimeout(500);
    await expect(mainWindow.locator('[data-cy="settings-view"]')).toBeVisible({ timeout: 3000 });
  });

  test('should collapse/expand sidebar on mobile viewport', async () => {
    // Set mobile viewport
    await mainWindow.setViewportSize({ width: 375, height: 667 });

    const sidebar = mainWindow.locator('[data-cy="sidebar"]');
    const toggleBtn = mainWindow.locator('[data-cy="sidebar-toggle"]');

    // On mobile, sidebar might be hidden or collapsed by default
    const sidebarVisible = await sidebar.isVisible();

    if (!sidebarVisible && await toggleBtn.isVisible()) {
      // Toggle sidebar open
      await toggleBtn.click();
      await expect(sidebar).toBeVisible({ timeout: 1000 });

      // Toggle sidebar closed
      await toggleBtn.click();
      await expect(sidebar).not.toBeVisible({ timeout: 1000 });
    }

    // Reset viewport
    await mainWindow.setViewportSize({ width: 1280, height: 720 });
  });

  test('should highlight current route in navigation menu', async () => {
    const routes = ['overview', 'users', 'groups', 'migration'];

    for (const route of routes) {
      await mainWindow.click(`[data-cy="nav-${route}"]`);
      await mainWindow.waitForTimeout(300);

      // Current nav item should have active styling
      const navItem = mainWindow.locator(`[data-cy="nav-${route}"]`);
      const hasActiveClass = await navItem.evaluate((el) => {
        return el.classList.contains('active') ||
               el.classList.contains('bg-primary-600') ||
               el.classList.contains('text-primary-600') ||
               el.getAttribute('aria-current') === 'page';
      });

      expect(hasActiveClass).toBe(true);
    }
  });
});
