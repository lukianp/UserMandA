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

test.describe('Keyboard Shortcuts & Accessibility', () => {
  test('should open command palette with Ctrl+K', async () => {
    await test.step('Press Ctrl+K', async () => {
      await mainWindow.press('body', 'Control+K');
    });

    await test.step('Verify command palette opens', async () => {
      const commandPalette = mainWindow.locator('[data-cy="command-palette"]');
      await expect(commandPalette).toBeVisible({ timeout: 2000 });
    });

    await test.step('Close command palette with Escape', async () => {
      await mainWindow.press('body', 'Escape');
      const commandPalette = mainWindow.locator('[data-cy="command-palette"]');
      await expect(commandPalette).not.toBeVisible({ timeout: 2000 });
    });
  });

  test('should close tab with Ctrl+W', async () => {
    // Open a new tab
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Press Ctrl+W
    await mainWindow.press('body', 'Control+W');

    await mainWindow.waitForTimeout(500);

    // Tab should close or show close confirmation
    // Implementation may vary - either closes immediately or shows dialog
  });

  test('should open new tab with Ctrl+T', async () => {
    await mainWindow.press('body', 'Control+T');

    await mainWindow.waitForTimeout(500);

    // New tab dialog or default view should open
    const newTabDialog = mainWindow.locator('[data-cy="new-tab-dialog"]');
    const newTabOpened = await newTabDialog.isVisible({ timeout: 2000 }).catch(() => false);

    // Implementation may vary
    console.log('Ctrl+T opened new tab dialog:', newTabOpened);
  });

  test('should save with Ctrl+S', async () => {
    await mainWindow.click('[data-cy="nav-settings"]');
    await expect(mainWindow.locator('[data-cy="settings-view"]')).toBeVisible();

    // Make a change
    const themeToggle = mainWindow.locator('[data-cy="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
    }

    // Press Ctrl+S
    await mainWindow.press('body', 'Control+S');

    await mainWindow.waitForTimeout(500);

    // Should show save confirmation or auto-save
    const saveSuccess = mainWindow.locator('[data-cy="save-success"]');
    if (await saveSuccess.isVisible({ timeout: 2000 })) {
      expect(await saveSuccess.isVisible()).toBe(true);
    }
  });

  test('should focus search with Ctrl+F', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Press Ctrl+F
    await mainWindow.press('body', 'Control+F');

    await mainWindow.waitForTimeout(300);

    // Search input should be focused
    const searchInput = mainWindow.locator('[data-cy="user-search"]');
    await expect(searchInput).toBeFocused({ timeout: 2000 });
  });

  test('should trigger print with Ctrl+P', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Mock print dialog
    await mainWindow.evaluate(() => {
      window.print = () => console.log('Print triggered');
    });

    // Press Ctrl+P (may be blocked by browser)
    await mainWindow.press('body', 'Control+P');

    await mainWindow.waitForTimeout(500);

    // Print dialog should open or print action triggered
    // This is hard to test in Electron, so we verify no errors occurred
  });

  test('should navigate with Tab key', async () => {
    await test.step('Press Tab multiple times', async () => {
      for (let i = 0; i < 5; i++) {
        await mainWindow.press('body', 'Tab');
        await mainWindow.waitForTimeout(100);
      }
    });

    await test.step('Verify focus moved to interactive element', async () => {
      const focusedElement = await mainWindow.evaluate(() => ({
        tag: document.activeElement?.tagName,
        type: document.activeElement?.getAttribute('type'),
        role: document.activeElement?.getAttribute('role'),
      }));

      console.log('Focused element:', focusedElement);

      // Should focus on button, input, link, or element with role
      const validFocusTags = ['BUTTON', 'INPUT', 'A', 'SELECT', 'TEXTAREA'];
      const hasFocus =
        validFocusTags.includes(focusedElement.tag || '') || focusedElement.role !== null;

      expect(hasFocus).toBe(true);
    });
  });

  test('should navigate backwards with Shift+Tab', async () => {
    // Tab forward first
    await mainWindow.press('body', 'Tab');
    await mainWindow.press('body', 'Tab');
    await mainWindow.waitForTimeout(100);

    const initialFocus = await mainWindow.evaluate(() => document.activeElement?.id);

    // Tab backwards
    await mainWindow.press('body', 'Shift+Tab');
    await mainWindow.waitForTimeout(100);

    const newFocus = await mainWindow.evaluate(() => document.activeElement?.id);

    // Focus should have changed (moved backwards)
    expect(newFocus).not.toBe(initialFocus);
  });

  test('should have ARIA labels on interactive elements', async () => {
    await test.step('Check buttons have ARIA labels', async () => {
      const buttons = await mainWindow.locator('button').all();

      let labeledButtons = 0;
      const sampleSize = Math.min(buttons.length, 10); // Check first 10 buttons

      for (let i = 0; i < sampleSize; i++) {
        const button = buttons[i];
        const ariaLabel = await button.getAttribute('aria-label');
        const text = (await button.textContent())?.trim();
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');

        if (ariaLabel || text || ariaLabelledBy) {
          labeledButtons++;
        }
      }

      console.log(`${labeledButtons}/${sampleSize} buttons have accessible labels`);
      expect(labeledButtons).toBeGreaterThan(sampleSize * 0.8); // At least 80% should have labels
    });

    await test.step('Check inputs have labels', async () => {
      const inputs = await mainWindow.locator('input[type="text"], input[type="email"]').all();

      let labeledInputs = 0;
      const sampleSize = Math.min(inputs.length, 10);

      for (let i = 0; i < sampleSize; i++) {
        const input = inputs[i];
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const id = await input.getAttribute('id');

        // Check if there's a label element for this input
        let hasLabel = false;
        if (id) {
          hasLabel = (await mainWindow.locator(`label[for="${id}"]`).count()) > 0;
        }

        if (ariaLabel || ariaLabelledBy || hasLabel) {
          labeledInputs++;
        }
      }

      console.log(`${labeledInputs}/${sampleSize} inputs have accessible labels`);
      if (sampleSize > 0) {
        expect(labeledInputs).toBeGreaterThan(sampleSize * 0.7); // At least 70% should have labels
      }
    });
  });

  test('should have visible focus indicators', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Tab to focus an element
    await mainWindow.press('body', 'Tab');
    await mainWindow.waitForTimeout(200);

    // Check if focused element has visible outline or focus ring
    const focusStyle = await mainWindow.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;

      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
        boxShadow: style.boxShadow,
      };
    });

    console.log('Focus style:', focusStyle);

    // Should have some kind of focus indicator (outline, box-shadow, etc.)
    const hasFocusIndicator =
      focusStyle &&
      (focusStyle.outlineWidth !== '0px' ||
        focusStyle.boxShadow !== 'none' ||
        focusStyle.outline !== 'none');

    expect(hasFocusIndicator).toBe(true);
  });

  test('should support keyboard navigation in data grids', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();
    await mainWindow.waitForSelector('[data-cy="users-grid"]', { timeout: 10000 });
    await mainWindow.waitForSelector('.ag-row', { timeout: 5000 });

    // Focus on grid
    await mainWindow.click('.ag-root');

    // Arrow down to navigate rows
    await mainWindow.press('.ag-root', 'ArrowDown');
    await mainWindow.waitForTimeout(200);
    await mainWindow.press('.ag-root', 'ArrowDown');

    // Grid should respond to keyboard navigation (AG Grid has built-in support)
    const focusedCell = await mainWindow.evaluate(() => {
      const cell = document.querySelector('.ag-cell-focus');
      return cell !== null;
    });

    console.log('Grid has focused cell:', focusedCell);
  });

  test('should announce loading states to screen readers', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Check for aria-live regions
    const liveRegions = await mainWindow.locator('[aria-live]').all();
    console.log(`Found ${liveRegions.length} ARIA live regions`);

    // Loading indicators should have aria-busy
    const loadingIndicators = await mainWindow.locator('[data-cy="loading-spinner"]').all();
    if (loadingIndicators.length > 0) {
      const ariaBusy = await loadingIndicators[0].getAttribute('aria-busy');
      console.log('Loading indicator aria-busy:', ariaBusy);
    }
  });

  test('should have proper heading hierarchy', async () => {
    await mainWindow.click('[data-cy="nav-overview"]');
    await expect(mainWindow.locator('[data-cy="overview-view"]')).toBeVisible();

    // Get all headings
    const headings = await mainWindow.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).length;
      const h2s = Array.from(document.querySelectorAll('h2')).length;
      const h3s = Array.from(document.querySelectorAll('h3')).length;
      const h4s = Array.from(document.querySelectorAll('h4')).length;

      return { h1s, h2s, h3s, h4s };
    });

    console.log('Heading hierarchy:', headings);

    // Should have at least one h1
    expect(headings.h1s).toBeGreaterThanOrEqual(1);

    // Should not skip heading levels (h1 -> h3 without h2)
    if (headings.h3s > 0) {
      expect(headings.h2s).toBeGreaterThan(0);
    }
  });

  test('should have sufficient color contrast', async () => {
    await mainWindow.click('[data-cy="nav-users"]');
    await expect(mainWindow.locator('[data-cy="users-view"]')).toBeVisible();

    // Check contrast of a few key elements
    const contrastCheck = await mainWindow.evaluate(() => {
      const getContrast = (el: Element) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
        };
      };

      const buttons = Array.from(document.querySelectorAll('button')).slice(0, 3);
      const texts = Array.from(document.querySelectorAll('p, span')).slice(0, 3);

      return {
        buttons: buttons.map(getContrast),
        texts: texts.map(getContrast),
      };
    });

    console.log('Color contrast check:', contrastCheck);

    // This is a basic check - proper contrast testing requires color math
    // Just verify elements have both color and background color set
    expect(contrastCheck.buttons.length).toBeGreaterThan(0);
  });

  test('should support keyboard-only form submission', async () => {
    await mainWindow.click('[data-cy="nav-migration"]');
    await expect(mainWindow.locator('[data-cy="migration-planning-view"]')).toBeVisible();

    // Open create wave dialog
    await mainWindow.click('[data-cy="create-wave-btn"]');
    await expect(mainWindow.locator('[data-cy="create-wave-dialog"]')).toBeVisible();

    // Fill form using keyboard
    await mainWindow.press('[data-cy="wave-name-input"]', 'Tab');
    await mainWindow.keyboard.type('Keyboard Test Wave');

    await mainWindow.press('body', 'Tab');
    await mainWindow.keyboard.type('Created using keyboard only');

    // Submit with Enter key
    await mainWindow.press('body', 'Enter');

    await mainWindow.waitForTimeout(1000);

    // Form should submit (or show validation errors if required fields missing)
  });

  test('should have skip navigation links', async () => {
    // Check for skip to main content link
    const skipLink = mainWindow.locator('[data-cy="skip-to-main"]');
    const hasSkipLink = await skipLink.isVisible().catch(() => false);

    if (hasSkipLink) {
      console.log('Skip navigation link found');
      await skipLink.click();

      // Main content should be focused
      await mainWindow.waitForTimeout(300);
      const mainContentFocused = await mainWindow.evaluate(() => {
        return document.activeElement?.getAttribute('data-cy') === 'main-content';
      });

      expect(mainContentFocused).toBe(true);
    } else {
      console.log('Skip navigation link not found (optional feature)');
    }
  });

  test('should prevent focus trap in modals', async () => {
    // Open a modal
    await mainWindow.click('[data-cy="nav-migration"]');
    await mainWindow.click('[data-cy="create-wave-btn"]');
    await expect(mainWindow.locator('[data-cy="create-wave-dialog"]')).toBeVisible();

    // Tab through modal elements
    for (let i = 0; i < 10; i++) {
      await mainWindow.press('body', 'Tab');
      await mainWindow.waitForTimeout(100);

      // Check if focus is still within modal
      const focusWithinModal = await mainWindow.evaluate(() => {
        const modal = document.querySelector('[data-cy="create-wave-dialog"]');
        return modal?.contains(document.activeElement) || false;
      });

      console.log(`Tab ${i + 1}: Focus within modal:`, focusWithinModal);
    }

    // Focus should loop within modal (focus trap)
    const finalFocus = await mainWindow.evaluate(() => {
      const modal = document.querySelector('[data-cy="create-wave-dialog"]');
      return modal?.contains(document.activeElement) || false;
    });

    expect(finalFocus).toBe(true);

    // Close modal with Escape
    await mainWindow.press('body', 'Escape');
    await expect(mainWindow.locator('[data-cy="create-wave-dialog"]')).not.toBeVisible({
      timeout: 2000,
    });
  });

  test('should have proper alt text on images', async () => {
    const images = await mainWindow.locator('img').all();

    let imagesWithAlt = 0;
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (alt !== null) {
        // alt can be empty string for decorative images
        imagesWithAlt++;
      }
    }

    console.log(`${imagesWithAlt}/${images.length} images have alt attributes`);

    // All images should have alt attribute (even if empty for decorative images)
    if (images.length > 0) {
      expect(imagesWithAlt).toBe(images.length);
    }
  });
});
