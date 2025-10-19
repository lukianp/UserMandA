/**
 * Test Helpers
 * Common utilities and helper functions for tests
 */

import { waitFor } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';

// ============================================================================
// Async Helpers
// ============================================================================

/**
 * Wait for a condition to be true with timeout
 */
export const waitForCondition = async (
  condition: () => boolean,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> => {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
};

/**
 * Wait for async operation to complete
 */
export const waitForAsync = async (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Flush all pending promises
 */
export const flushPromises = (): Promise<void> => {
  return new Promise(resolve => setImmediate(resolve));
};

// ============================================================================
// Mock Helpers
// ============================================================================

/**
 * Create a jest mock function with return value
 */
export const mockFn = <T = any>(returnValue?: T): jest.Mock => {
  const mock = jest.fn();
  if (returnValue !== undefined) {
    mock.mockReturnValue(returnValue);
  }
  return mock;
};

/**
 * Create a jest mock function with async return value
 */
export const mockAsyncFn = <T = any>(returnValue: T, delay = 0): jest.Mock => {
  return jest.fn().mockImplementation(() =>
    new Promise(resolve => setTimeout(() => resolve(returnValue), delay))
  );
};

/**
 * Create a jest mock function that throws an error
 */
export const mockErrorFn = (error: string | Error): jest.Mock => {
  const err = typeof error === 'string' ? new Error(error) : error;
  return jest.fn().mockRejectedValue(err);
};

/**
 * Create a mock IPC response
 */
export const mockIPCResponse = <T = any>(data: T, success = true): jest.Mock => {
  return jest.fn().mockResolvedValue({ success, data, error: success ? null : 'Mock error' });
};

// ============================================================================
// DOM Helpers
// ============================================================================

/**
 * Get element by test ID
 */
export const getByTestId = (container: HTMLElement, testId: string): HTMLElement => {
  const element = container.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
  if (!element) {
    throw new Error(`Element with data-testid="${testId}" not found`);
  }
  return element;
};

/**
 * Get all elements by test ID
 */
export const getAllByTestId = (container: HTMLElement, testId: string): HTMLElement[] => {
  return Array.from(container.querySelectorAll(`[data-testid="${testId}"]`));
};

/**
 * Check if element exists
 */
export const elementExists = (container: HTMLElement, testId: string): boolean => {
  return container.querySelector(`[data-testid="${testId}"]`) !== null;
};

// ============================================================================
// Event Helpers
// ============================================================================

/**
 * Simulate input change event
 */
export const changeInput = (input: HTMLInputElement, value: string): void => {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

/**
 * Simulate click event
 */
export const clickElement = (element: HTMLElement): void => {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
};

/**
 * Simulate form submission
 */
export const submitForm = (form: HTMLFormElement): void => {
  form.dispatchEvent(new Event('submit', { bubbles: true }));
};

// ============================================================================
// Store Helpers
// ============================================================================

/**
 * Create a mock Zustand store
 */
export const createMockStore = <T extends Record<string, any>>(initialState: T) => {
  let state = { ...initialState };

  return {
    getState: () => state,
    setState: (updater: Partial<T> | ((state: T) => Partial<T>)) => {
      if (typeof updater === 'function') {
        state = { ...state, ...updater(state) };
      } else {
        state = { ...state, ...updater };
      }
    },
    subscribe: jest.fn(),
    destroy: jest.fn()
  };
};

// ============================================================================
// Console Helpers
// ============================================================================

/**
 * Suppress console errors during test
 */
export const suppressConsoleError = (fn: () => void | Promise<void>): void | Promise<void> => {
  const originalError = console.error;
  console.error = jest.fn();

  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        console.error = originalError;
      });
    }
  } finally {
    if (!(fn() instanceof Promise)) {
      console.error = originalError;
    }
  }
};

/**
 * Capture console output
 */
export const captureConsole = () => {
  const logs: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args: any[]) => logs.push(args.join(' '));
  console.error = (...args: any[]) => errors.push(args.join(' '));
  console.warn = (...args: any[]) => warnings.push(args.join(' '));

  return {
    logs,
    errors,
    warnings,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
};

// ============================================================================
// Data Helpers
// ============================================================================

/**
 * Create array of specified length
 */
export const createArray = <T>(length: number, creator: (index: number) => T): T[] => {
  return Array.from({ length }, (_, index) => creator(index));
};

/**
 * Shuffle array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Pick random items from array
 */
export const pickRandom = <T>(array: T[], count: number): T[] => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
};

// ============================================================================
// Test Lifecycle Helpers
// ============================================================================

/**
 * Setup and teardown helper
 */
export const setupAndTeardown = (
  setup: () => void | Promise<void>,
  teardown: () => void | Promise<void>
) => {
  beforeEach(async () => {
    await setup();
  });

  afterEach(async () => {
    await teardown();
  });
};

/**
 * Mock timer helpers
 */
export const useFakeTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  return {
    advanceTimersByTime: (ms: number) => jest.advanceTimersByTime(ms),
    runAllTimers: () => jest.runAllTimers(),
    runOnlyPendingTimers: () => jest.runOnlyPendingTimers()
  };
};

// ============================================================================
// Snapshot Helpers
// ============================================================================

/**
 * Create snapshot with custom serializer
 */
export const snapshotWithSerializer = (component: any, serializer?: (val: any) => any) => {
  if (serializer) {
    expect.addSnapshotSerializer({
      test: () => true,
      serialize: serializer
    });
  }
  expect(component).toMatchSnapshot();
};

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Wait for element to appear
 */
export const waitForElement = async (
  container: HTMLElement,
  testId: string,
  timeout = 1000
): Promise<HTMLElement> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = container.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
    if (element) return element;
    await waitForAsync(50);
  }

  throw new Error(`Element with testId="${testId}" not found within ${timeout}ms`);
};

/**
 * Wait for element to disappear
 */
export const waitForElementToBeRemoved = async (
  container: HTMLElement,
  testId: string,
  timeout = 1000
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = container.querySelector(`[data-testid="${testId}"]`);
    if (!element) return;
    await waitForAsync(50);
  }

  throw new Error(`Element with testId="${testId}" still present after ${timeout}ms`);
};

// ============================================================================
// Component Testing Helpers
// ============================================================================

/**
 * Find rendered component in tree
 */
export const findComponent = (result: RenderResult, componentName: string): HTMLElement | null => {
  return result.container.querySelector(`[data-component="${componentName}"]`);
};

/**
 * Get component props from data attributes
 */
export const getComponentProps = (element: HTMLElement): Record<string, any> => {
  const props: Record<string, any> = {};
  Array.from(element.attributes).forEach(attr => {
    if (attr.name.startsWith('data-prop-')) {
      const propName = attr.name.replace('data-prop-', '');
      props[propName] = attr.value;
    }
  });
  return props;
};

// ============================================================================
// Accessibility Helpers
// ============================================================================

/**
 * Check if element has accessible name
 */
export const hasAccessibleName = (element: HTMLElement): boolean => {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    (element instanceof HTMLLabelElement && element.textContent)
  );
};

/**
 * Get accessible name
 */
export const getAccessibleName = (element: HTMLElement): string | null => {
  return (
    element.getAttribute('aria-label') ||
    element.textContent ||
    element.getAttribute('title') ||
    null
  );
};

// ============================================================================
// Export all helpers
// ============================================================================

export const testHelpers = {
  // Async
  waitForCondition,
  waitForAsync,
  flushPromises,

  // Mocks
  mockFn,
  mockAsyncFn,
  mockErrorFn,
  mockIPCResponse,

  // DOM
  getByTestId,
  getAllByTestId,
  elementExists,

  // Events
  changeInput,
  clickElement,
  submitForm,

  // Store
  createMockStore,

  // Console
  suppressConsoleError,
  captureConsole,

  // Data
  createArray,
  shuffleArray,
  pickRandom,

  // Lifecycle
  setupAndTeardown,
  useFakeTimers,

  // Snapshots
  snapshotWithSerializer,

  // Queries
  waitForElement,
  waitForElementToBeRemoved,

  // Components
  findComponent,
  getComponentProps,

  // Accessibility
  hasAccessibleName,
  getAccessibleName
};

export default testHelpers;
