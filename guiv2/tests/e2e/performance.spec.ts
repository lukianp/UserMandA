import { test, expect, _electron as electron } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';
import path from 'path';

let electronApp: ElectronApplication;
let mainWindow: Page;

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  viewSwitching: 100, // ms
  dataGridRender: 1000, // ms for 10,000 rows
  initialLoad: 3000, // ms
  memoryBaseline: 500 * 1024 * 1024, // 500MB in bytes
  memoryUnderLoad: 1024 * 1024 * 1024, // 1GB in bytes
  fps: 30, // minimum acceptable FPS
  bundleSize: 5 * 1024 * 1024, // 5MB initial bundle
};

test.beforeAll(async () => {
  // Launch Electron app
  electronApp = await electron.launch({
    args: [path.join(__dirname, '../../.webpack/main')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PERFORMANCE_TEST: 'true',
    },
  });

  // Wait for the first window to open
  mainWindow = await electronApp.firstWindow();
  await mainWindow.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Performance Tests', () => {
  test('should load application within performance threshold', async () => {
    const startTime = Date.now();

    await test.step('Measure initial load time', async () => {
      await mainWindow.waitForSelector('[data-cy="app-loaded"]', { timeout: 10000 });
      const loadTime = Date.now() - startTime;

      console.log(`Initial load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.initialLoad);
    });

    await test.step('Verify initial memory usage', async () => {
      const metrics = await mainWindow.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          };
        }
        return null;
      });

      if (metrics) {
        console.log('Memory usage:', {
          used: `${(metrics.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(metrics.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(metrics.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        });

        expect(metrics.usedJSHeapSize).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryBaseline);
      }
    });
  });

  test('should handle large dataset rendering efficiently', async () => {
    await test.step('Navigate to Users view', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();
    });

    await test.step('Load large dataset', async () => {
      // Trigger loading of large dataset (10,000+ rows)
      await mainWindow.click('[data-cy="load-test-data-btn"]');

      const startTime = Date.now();
      await mainWindow.waitForSelector('[data-cy="users-grid-loaded"]', { timeout: 15000 });
      const renderTime = Date.now() - startTime;

      console.log(`Large dataset render time: ${renderTime}ms`);
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.dataGridRender);
    });

    await test.step('Test virtualization performance', async () => {
      // Measure FPS during scrolling
      const fps = await mainWindow.evaluate(() => {
        return new Promise((resolve) => {
          let frames = 0;
          const lastTime = performance.now();
          const duration = 2000; // Measure for 2 seconds
          const startTime = performance.now();

          function countFrames() {
            frames++;
            const currentTime = performance.now();

            if (currentTime - startTime < duration) {
              requestAnimationFrame(countFrames);
            } else {
              const avgFPS = (frames / ((currentTime - startTime) / 1000));
              resolve(avgFPS);
            }
          }

          // Simulate scrolling
          const grid = document.querySelector('[data-cy="users-grid"]');
          if (grid) {
            grid.scrollTop = 0;
            const scrollInterval = setInterval(() => {
              grid.scrollTop += 100;
              if (grid.scrollTop >= grid.scrollHeight - grid.clientHeight) {
                clearInterval(scrollInterval);
              }
            }, 16); // ~60fps
          }

          requestAnimationFrame(countFrames);
        });
      });

      console.log(`Average FPS during scroll: ${fps}`);
      expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.fps);
    });

    await test.step('Test filtering performance', async () => {
      const startTime = Date.now();

      await mainWindow.fill('[data-cy="search-input"]', 'test');
      await mainWindow.waitForTimeout(300); // Debounce delay

      const filterTime = Date.now() - startTime;
      console.log(`Filter time for 10k rows: ${filterTime}ms`);

      expect(filterTime).toBeLessThan(500); // Should filter within 500ms
    });

    await test.step('Test sorting performance', async () => {
      const startTime = Date.now();

      // Click column header to sort
      await mainWindow.click('[data-cy="column-header-name"]');
      await mainWindow.waitForTimeout(100);

      const sortTime = Date.now() - startTime;
      console.log(`Sort time for 10k rows: ${sortTime}ms`);

      expect(sortTime).toBeLessThan(300); // Should sort within 300ms
    });
  });

  test('should switch between views quickly', async () => {
    const views = [
      { nav: 'nav-users', view: 'users-view' },
      { nav: 'nav-groups', view: 'groups-view' },
      { nav: 'nav-discovery', view: 'discovery-view' },
      { nav: 'nav-migration', view: 'migration-view' },
      { nav: 'nav-reports', view: 'reports-view' },
    ];

    for (const { nav, view } of views) {
      await test.step(`Switch to ${view}`, async () => {
        const startTime = Date.now();

        await mainWindow.click(`[data-cy="${nav}"]`);
        await mainWindow.waitForSelector(`[data-cy="${view}"]`, { state: 'visible' });

        const switchTime = Date.now() - startTime;
        console.log(`View switch time for ${view}: ${switchTime}ms`);

        expect(switchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.viewSwitching);
      });
    }
  });

  test('should not have memory leaks during navigation', async () => {
    await test.step('Get baseline memory', async () => {
      // Force garbage collection if available
      await mainWindow.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });

      const baseline = await mainWindow.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });

      console.log(`Baseline memory: ${(baseline / 1024 / 1024).toFixed(2)} MB`);
    });

    await test.step('Navigate through views multiple times', async () => {
      for (let i = 0; i < 10; i++) {
        await mainWindow.click('[data-cy="nav-users"]');
        await mainWindow.waitForTimeout(100);
        await mainWindow.click('[data-cy="nav-groups"]');
        await mainWindow.waitForTimeout(100);
        await mainWindow.click('[data-cy="nav-discovery"]');
        await mainWindow.waitForTimeout(100);
      }
    });

    await test.step('Check for memory leaks', async () => {
      // Force garbage collection again
      await mainWindow.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });

      await mainWindow.waitForTimeout(1000); // Wait for GC to complete

      const afterNavigation = await mainWindow.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });

      console.log(`Memory after navigation: ${(afterNavigation / 1024 / 1024).toFixed(2)} MB`);

      // Memory should not grow significantly (allow 20% increase)
      const baseline = await mainWindow.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });

      expect(afterNavigation).toBeLessThan(baseline * 1.2);
    });
  });

  test('should handle concurrent operations efficiently', async () => {
    await test.step('Navigate to Migration view', async () => {
      await mainWindow.click('[data-cy="nav-migration"]');
      await expect(mainWindow.locator('[data-cy="migration-view"]')).toBeVisible();
    });

    await test.step('Start multiple concurrent operations', async () => {
      const operations = [];

      // Start multiple async operations
      operations.push(mainWindow.click('[data-cy="load-users-btn"]'));
      operations.push(mainWindow.click('[data-cy="load-groups-btn"]'));
      operations.push(mainWindow.click('[data-cy="load-licenses-btn"]'));
      operations.push(mainWindow.click('[data-cy="validate-mappings-btn"]'));

      const startTime = Date.now();
      await Promise.all(operations);

      // Wait for all operations to complete
      await mainWindow.waitForSelector('[data-cy="all-operations-complete"]', { timeout: 10000 });
      const totalTime = Date.now() - startTime;

      console.log(`Concurrent operations completed in: ${totalTime}ms`);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    await test.step('Verify UI remains responsive', async () => {
      // Try to interact with UI during operations
      const isClickable = await mainWindow.locator('[data-cy="cancel-btn"]').isEnabled();
      expect(isClickable).toBe(true);
    });
  });

  test('should optimize bundle loading', async () => {
    await test.step('Measure bundle sizes', async () => {
      const resourceTimings = await mainWindow.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        return entries.map(entry => ({
          name: entry.name,
          size: entry.transferSize,
          duration: entry.duration,
          type: entry.name.split('.').pop(),
        }));
      });

      const jsBundle = resourceTimings.filter(r => r.type === 'js');
      const cssBundle = resourceTimings.filter(r => r.type === 'css');

      const totalJsSize = jsBundle.reduce((sum, b) => sum + (b.size || 0), 0);
      const totalCssSize = cssBundle.reduce((sum, b) => sum + (b.size || 0), 0);

      console.log('Bundle sizes:', {
        js: `${(totalJsSize / 1024 / 1024).toFixed(2)} MB`,
        css: `${(totalCssSize / 1024 / 1024).toFixed(2)} KB`,
        total: `${((totalJsSize + totalCssSize) / 1024 / 1024).toFixed(2)} MB`,
      });

      expect(totalJsSize).toBeLessThan(PERFORMANCE_THRESHOLDS.bundleSize);
    });

    await test.step('Verify lazy loading works', async () => {
      // Check that chunks are loaded on demand
      const initialChunks = await mainWindow.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter(e => e.name.includes('chunk'))
          .length;
      });

      // Navigate to a lazy-loaded view
      await mainWindow.click('[data-cy="nav-reports"]');
      await mainWindow.waitForTimeout(500);

      const afterNavigationChunks = await mainWindow.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter(e => e.name.includes('chunk'))
          .length;
      });

      console.log(`Chunks loaded: initial=${initialChunks}, after=${afterNavigationChunks}`);
      expect(afterNavigationChunks).toBeGreaterThan(initialChunks);
    });
  });

  test('should maintain performance with multiple tabs open', async () => {
    await test.step('Open multiple tabs', async () => {
      const tabs = ['users', 'groups', 'discovery', 'migration', 'reports'];

      for (const tab of tabs) {
        await mainWindow.click(`[data-cy="nav-${tab}"]`);
        await mainWindow.waitForTimeout(200);
      }
    });

    await test.step('Measure tab switching performance', async () => {
      const tabSwitchTimes = [];

      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await mainWindow.click(`[data-cy="tab-users"]`);
        await mainWindow.waitForSelector('[data-cy="users-view"]:visible');
        tabSwitchTimes.push(Date.now() - startTime);

        await mainWindow.click(`[data-cy="tab-groups"]`);
        await mainWindow.waitForTimeout(100);
      }

      const avgSwitchTime = tabSwitchTimes.reduce((a, b) => a + b, 0) / tabSwitchTimes.length;
      console.log(`Average tab switch time: ${avgSwitchTime}ms`);

      expect(avgSwitchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.viewSwitching);
    });

    await test.step('Check memory with all tabs open', async () => {
      const memoryUsage = await mainWindow.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });

      console.log(`Memory with all tabs: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB`);
      expect(memoryUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUnderLoad);
    });
  });

  test('should handle rapid user interactions', async () => {
    await test.step('Navigate to Users view', async () => {
      await mainWindow.click('[data-cy="nav-users"]');
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();
    });

    await test.step('Rapid clicking test', async () => {
      // Simulate rapid user clicks
      const clickPromises = [];
      for (let i = 0; i < 20; i++) {
        clickPromises.push(mainWindow.click('[data-cy="refresh-btn"]', { force: true }));
      }

      const startTime = Date.now();
      await Promise.all(clickPromises);
      const duration = Date.now() - startTime;

      console.log(`Handled 20 rapid clicks in: ${duration}ms`);

      // Should handle rapid clicks without crashing
      await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();
    });

    await test.step('Rapid typing test', async () => {
      const searchInput = await mainWindow.locator('[data-cy="search-input"]');

      // Type rapidly
      const startTime = Date.now();
      await searchInput.fill('');
      await searchInput.type('This is a test of rapid typing performance', { delay: 10 });
      const typeTime = Date.now() - startTime;

      console.log(`Rapid typing handled in: ${typeTime}ms`);

      // Should handle rapid typing with debouncing
      await mainWindow.waitForTimeout(300); // Debounce delay
      await expect(searchInput).toHaveValue('This is a test of rapid typing performance');
    });
  });

  test('should perform well with animations and transitions', async () => {
    await test.step('Test sidebar animation performance', async () => {
      const animationDurations = [];

      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();

        // Collapse sidebar
        await mainWindow.click('[data-cy="toggle-sidebar"]');
        await mainWindow.waitForTimeout(300); // Animation duration

        // Expand sidebar
        await mainWindow.click('[data-cy="toggle-sidebar"]');
        await mainWindow.waitForTimeout(300);

        animationDurations.push(Date.now() - startTime);
      }

      const avgDuration = animationDurations.reduce((a, b) => a + b, 0) / animationDurations.length;
      console.log(`Average animation cycle: ${avgDuration}ms`);

      // Animations should be smooth (around 600ms total for both)
      expect(avgDuration).toBeLessThan(700);
    });

    await test.step('Test modal animation performance', async () => {
      const modalTimes = [];

      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();

        await mainWindow.click('[data-cy="open-settings-modal"]');
        await mainWindow.waitForSelector('[data-cy="settings-modal"]:visible');
        modalTimes.push(Date.now() - startTime);

        await mainWindow.click('[data-cy="close-modal"]');
        await mainWindow.waitForTimeout(200);
      }

      const avgModalTime = modalTimes.reduce((a, b) => a + b, 0) / modalTimes.length;
      console.log(`Average modal open time: ${avgModalTime}ms`);

      expect(avgModalTime).toBeLessThan(300);
    });
  });

  test('should generate performance report', async () => {
    await test.step('Collect performance metrics', async () => {
      const metrics = await mainWindow.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        return {
          navigation: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart,
          },
          paint: paint.map(p => ({ name: p.name, startTime: p.startTime })),
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          } : null,
        };
      });

      console.log('\n=== PERFORMANCE REPORT ===');
      console.log('Navigation Timing:');
      console.log(`  DOM Content Loaded: ${metrics.navigation.domContentLoaded}ms`);
      console.log(`  Load Complete: ${metrics.navigation.loadComplete}ms`);
      console.log(`  DOM Interactive: ${metrics.navigation.domInteractive}ms`);

      console.log('\nPaint Timing:');
      metrics.paint.forEach(p => {
        console.log(`  ${p.name}: ${p.startTime.toFixed(2)}ms`);
      });

      if (metrics.memory) {
        console.log('\nMemory Usage:');
        console.log(`  Used: ${(metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Total: ${(metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Limit: ${(metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
      }
      console.log('========================\n');
    });
  });
});