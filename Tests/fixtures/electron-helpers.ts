/**
 * Electron Test Helpers
 *
 * Reusable fixtures and utilities for Electron E2E tests
 */

import { _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Launch Electron application for testing
 */
export async function launchElectronApp(): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({
    args: [path.join(__dirname, '../../.webpack/main')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      // Set test data directory
      TEST_DATA_DIR: path.join(__dirname, '../fixtures'),
    },
  });

  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('[data-cy="app-loaded"]', { timeout: 10000 });

  return { app, page };
}

/**
 * Wait for AG Grid to be ready with data
 */
export async function waitForGridReady(page: Page, selector = '.ag-root', timeout = 15000) {
  await page.waitForSelector(selector, { timeout });
  await page.waitForSelector('.ag-row', { timeout });

  // Wait for grid to finish rendering
  await page.waitForFunction(() => {
    const grid = document.querySelector('.ag-root');
    return grid && !grid.classList.contains('ag-busy');
  }, { timeout: 5000 }).catch(() => {
    // Grid might not have busy state, continue
  });
}

/**
 * Get row count from AG Grid
 */
export async function getGridRowCount(page: Page): Promise<number> {
  return await page.locator('.ag-row').count();
}

/**
 * Select row in AG Grid by index
 */
export async function selectGridRow(page: Page, index: number) {
  const row = page.locator('.ag-row').nth(index);
  await row.click();
  return row;
}

/**
 * Select multiple rows in AG Grid
 */
export async function selectMultipleGridRows(page: Page, indices: number[]) {
  for (let i = 0; i < indices.length; i++) {
    const modifier = i === 0 ? [] : ['Control'];
    if (modifier.length > 0) {
      await page.keyboard.down('Control');
    }
    await selectGridRow(page, indices[i]);
    if (modifier.length > 0) {
      await page.keyboard.up('Control');
    }
  }
}

/**
 * Wait for element with timeout and custom error message
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000, state: 'visible' | 'hidden' = 'visible') {
  try {
    await page.waitForSelector(selector, { state, timeout });
  } catch (error) {
    throw new Error(`Element ${selector} did not become ${state} within ${timeout}ms`);
  }
}

/**
 * Create temporary test file in downloads directory
 */
export function getTempDownloadPath(filename: string): string {
  const tempDir = os.tmpdir();
  const downloadDir = path.join(tempDir, 'electron-test-downloads');

  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  return path.join(downloadDir, filename);
}

/**
 * Clean up temporary test files
 */
export function cleanupTestFiles(filePaths: string[]) {
  filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

/**
 * Wait for download to complete
 */
export async function waitForDownload(page: Page, triggerAction: () => Promise<void>): Promise<string> {
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

  await triggerAction();

  const download = await downloadPromise;
  const suggestedFilename = download.suggestedFilename();
  const downloadPath = getTempDownloadPath(suggestedFilename);

  await download.saveAs(downloadPath);

  return downloadPath;
}

/**
 * Verify file exists and has content
 */
export function verifyFileExists(filePath: string, minSize = 0): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const stats = fs.statSync(filePath);
  return stats.size >= minSize;
}

/**
 * Read CSV file content
 */
export function readCsvFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').filter(line => line.trim().length > 0);
}

/**
 * Wait for PowerShell script execution to complete
 * Monitors loading indicators and completion status
 */
export async function waitForPowerShellExecution(page: Page, maxTimeout = 60000) {
  const startTime = Date.now();

  // Wait for loading indicator to appear
  const loadingSelector = '[data-cy="loading-indicator"], [data-cy="discovery-running"], [data-cy="operation-running"]';
  try {
    await page.waitForSelector(loadingSelector, { state: 'visible', timeout: 5000 });
  } catch {
    // Loading indicator might not appear for fast operations
  }

  // Wait for loading indicator to disappear
  await page.waitForSelector(loadingSelector, { state: 'hidden', timeout: maxTimeout });

  // Wait for completion indicator
  const completeSelector = '[data-cy="operation-complete"], [data-cy="discovery-complete"]';
  try {
    await page.waitForSelector(completeSelector, { state: 'visible', timeout: 5000 });
  } catch {
    // Completion indicator might not be shown
  }

  const elapsed = Date.now() - startTime;
  console.log(`PowerShell execution completed in ${elapsed}ms`);
}

/**
 * Fill form field with validation
 */
export async function fillFormField(page: Page, selector: string, value: string, options?: { clear?: boolean }) {
  const field = page.locator(selector);

  if (options?.clear) {
    await field.clear();
  }

  await field.fill(value);

  // Verify value was set
  const actualValue = await field.inputValue();
  if (actualValue !== value) {
    throw new Error(`Failed to fill field ${selector}. Expected: ${value}, Got: ${actualValue}`);
  }
}

/**
 * Select dropdown option by value
 */
export async function selectDropdownOption(page: Page, selectSelector: string, optionValue: string) {
  await page.click(selectSelector);
  await page.waitForTimeout(200); // Wait for dropdown animation
  await page.click(`[data-value="${optionValue}"], [value="${optionValue}"]`);
}

/**
 * Wait for toast/notification message
 */
export async function waitForNotification(page: Page, expectedText?: string, timeout = 5000) {
  const notificationSelector = '[data-cy="notification"], [data-cy="toast"], [role="alert"]';
  await page.waitForSelector(notificationSelector, { state: 'visible', timeout });

  if (expectedText) {
    const notification = page.locator(notificationSelector);
    const text = await notification.textContent();
    if (!text?.includes(expectedText)) {
      throw new Error(`Notification text "${text}" does not contain "${expectedText}"`);
    }
  }
}

/**
 * Navigate to view and wait for it to load
 */
export async function navigateToView(page: Page, navSelector: string, viewSelector: string) {
  await page.click(navSelector);
  await waitForElement(page, viewSelector, 10000);

  // Wait for any lazy-loaded content
  await page.waitForTimeout(500);
}

/**
 * Apply search filter and wait for results
 */
export async function applySearchFilter(page: Page, searchSelector: string, searchTerm: string, debounceMs = 500) {
  const searchInput = page.locator(searchSelector);
  await searchInput.fill(searchTerm);

  // Wait for debounce
  await page.waitForTimeout(debounceMs);

  // Wait for grid to update
  await page.waitForTimeout(300);
}

/**
 * Clear search filter
 */
export async function clearSearchFilter(page: Page, clearButtonSelector: string, debounceMs = 500) {
  await page.click(clearButtonSelector);
  await page.waitForTimeout(debounceMs);
}

/**
 * Get progress bar value
 */
export async function getProgressValue(page: Page, progressSelector: string): Promise<number> {
  const progressBar = page.locator(progressSelector);
  const value = await progressBar.getAttribute('aria-valuenow');
  return parseInt(value || '0', 10);
}

/**
 * Wait for progress to reach target value
 */
export async function waitForProgress(page: Page, progressSelector: string, targetValue: number, timeout = 30000) {
  await page.waitForFunction(
    ({ selector, target }) => {
      const progressBar = document.querySelector(selector);
      if (!progressBar) return false;
      const current = parseInt(progressBar.getAttribute('aria-valuenow') || '0', 10);
      return current >= target;
    },
    { selector: progressSelector, target: targetValue },
    { timeout }
  );
}

/**
 * Confirm dialog action
 */
export async function confirmDialog(page: Page, confirmButtonSelector: string) {
  await page.waitForSelector(confirmButtonSelector, { state: 'visible', timeout: 5000 });
  await page.click(confirmButtonSelector);
}

/**
 * Cancel dialog action
 */
export async function cancelDialog(page: Page, cancelButtonSelector: string) {
  await page.waitForSelector(cancelButtonSelector, { state: 'visible', timeout: 5000 });
  await page.click(cancelButtonSelector);
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(__dirname, `../../test-results/screenshots/${name}-${timestamp}.png`);

  const dir = path.dirname(screenshotPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

/**
 * Retry action with exponential backoff
 */
export async function retryWithBackoff<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = initialDelayMs * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed without error');
}

/**
 * Load test profile fixture
 */
export function loadTestProfile(): any {
  const profilePath = path.join(__dirname, 'test-profile.json');
  const content = fs.readFileSync(profilePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Create test data fixture
 */
export function createTestData<T>(template: T, count: number, modifier: (item: T, index: number) => T): T[] {
  const data: T[] = [];
  for (let i = 0; i < count; i++) {
    data.push(modifier({ ...template }, i));
  }
  return data;
}
