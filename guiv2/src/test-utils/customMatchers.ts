/**
 * Custom Jest Matchers
 * Extended matchers for common test assertions
 */

import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';

// ============================================================================
// Array Matchers
// ============================================================================

/**
 * Check if array contains object with matching properties
 */
const toContainObjectMatching: MatcherFunction = function (received: any[], expected: Record<string, any>) {
  const pass = received.some(item =>
    Object.entries(expected).every(([key, value]) => item[key] === value)
  );

  return {
    pass,
    message: () =>
      pass
        ? `Expected array not to contain object matching ${JSON.stringify(expected)}`
        : `Expected array to contain object matching ${JSON.stringify(expected)}`
  };
};

/**
 * Check if array has specific length
 */
const toHaveLength: MatcherFunction = function (received: any[], expected: number) {
  const pass = received.length === expected;

  return {
    pass,
    message: () =>
      pass
        ? `Expected array not to have length ${expected}`
        : `Expected array to have length ${expected}, but got ${received.length}`
  };
};

/**
 * Check if array contains all items
 */
const toContainAll: MatcherFunction = function (received: any[], expected: any[]) {
  const pass = expected.every(item => received.includes(item));

  return {
    pass,
    message: () =>
      pass
        ? `Expected array not to contain all items ${JSON.stringify(expected)}`
        : `Expected array to contain all items ${JSON.stringify(expected)}`
  };
};

// ============================================================================
// Object Matchers
// ============================================================================

/**
 * Check if object has all specified keys
 */
const toHaveKeys: MatcherFunction = function (received: Record<string, any>, expected: string[]) {
  const keys = Object.keys(received);
  const pass = expected.every(key => keys.includes(key));

  return {
    pass,
    message: () =>
      pass
        ? `Expected object not to have keys ${JSON.stringify(expected)}`
        : `Expected object to have keys ${JSON.stringify(expected)}, but got ${JSON.stringify(keys)}`
  };
};

/**
 * Check if object has nested property
 */
const toHaveNestedProperty: MatcherFunction = function (received: any, path: string, value?: any) {
  const keys = path.split('.');
  let current = received;

  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return {
        pass: false,
        message: () => `Expected object to have nested property "${path}"`
      };
    }
    current = current[key];
  }

  const pass = value === undefined || current === value;

  return {
    pass,
    message: () =>
      pass
        ? `Expected object not to have nested property "${path}" with value ${JSON.stringify(value)}`
        : `Expected object to have nested property "${path}" with value ${JSON.stringify(value)}, but got ${JSON.stringify(current)}`
  };
};

// ============================================================================
// Function Matchers
// ============================================================================

/**
 * Check if function was called with partial object
 */
const toHaveBeenCalledWithObjectContaining: MatcherFunction = function (
  received: jest.Mock,
  expected: Record<string, any>
) {
  const calls = received.mock.calls;
  const pass = calls.some(call =>
    call.some(arg =>
      typeof arg === 'object' &&
      arg !== null &&
      Object.entries(expected).every(([key, value]) => arg[key] === value)
    )
  );

  return {
    pass,
    message: () =>
      pass
        ? `Expected mock not to have been called with object containing ${JSON.stringify(expected)}`
        : `Expected mock to have been called with object containing ${JSON.stringify(expected)}`
  };
};

/**
 * Check if async function resolves to value
 */
const toResolveWith: MatcherFunction = async function (received: Promise<any>, expected: any) {
  try {
    const result = await received;
    const pass = this.equals(result, expected);

    return {
      pass,
      message: () =>
        pass
          ? `Expected promise not to resolve with ${JSON.stringify(expected)}`
          : `Expected promise to resolve with ${JSON.stringify(expected)}, but got ${JSON.stringify(result)}`
    };
  } catch (error) {
    return {
      pass: false,
      message: () => `Expected promise to resolve, but it rejected with ${error}`
    };
  }
};

/**
 * Check if async function rejects with error message
 */
const toRejectWithMessage: MatcherFunction = async function (received: Promise<any>, expected: string) {
  try {
    await received;
    return {
      pass: false,
      message: () => `Expected promise to reject with message "${expected}", but it resolved`
    };
  } catch (error: any) {
    const message = error.message || String(error);
    const pass = message.includes(expected);

    return {
      pass,
      message: () =>
        pass
          ? `Expected promise not to reject with message containing "${expected}"`
          : `Expected promise to reject with message containing "${expected}", but got "${message}"`
    };
  }
};

// ============================================================================
// DOM Matchers
// ============================================================================

/**
 * Check if element has specific class
 */
const toHaveClass: MatcherFunction = function (received: HTMLElement, expected: string) {
  const pass = received.classList.contains(expected);

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have class "${expected}"`
        : `Expected element to have class "${expected}"`
  };
};

/**
 * Check if element has multiple classes
 */
const toHaveClasses: MatcherFunction = function (received: HTMLElement, expected: string[]) {
  const pass = expected.every(cls => received.classList.contains(cls));

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have classes ${JSON.stringify(expected)}`
        : `Expected element to have classes ${JSON.stringify(expected)}`
  };
};

/**
 * Check if element is visible
 */
const toBeVisible: MatcherFunction = function (received: HTMLElement) {
  const pass = received.offsetParent !== null && window.getComputedStyle(received).visibility !== 'hidden';

  return {
    pass,
    message: () =>
      pass
        ? 'Expected element not to be visible'
        : 'Expected element to be visible'
  };
};

/**
 * Check if element has attribute with value
 */
const toHaveAttributeWithValue: MatcherFunction = function (
  received: HTMLElement,
  attribute: string,
  value: string
) {
  const actualValue = received.getAttribute(attribute);
  const pass = actualValue === value;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have attribute "${attribute}" with value "${value}"`
        : `Expected element to have attribute "${attribute}" with value "${value}", but got "${actualValue}"`
  };
};

// ============================================================================
// Type Matchers
// ============================================================================

/**
 * Check if value is of specific type
 */
const toBeOfType: MatcherFunction = function (received: any, expected: string) {
  const actualType = typeof received;
  const pass = actualType === expected;

  return {
    pass,
    message: () =>
      pass
        ? `Expected value not to be of type "${expected}"`
        : `Expected value to be of type "${expected}", but got "${actualType}"`
  };
};

/**
 * Check if value is array of specific type
 */
const toBeArrayOf: MatcherFunction = function (received: any[], expected: string) {
  if (!Array.isArray(received)) {
    return {
      pass: false,
      message: () => `Expected value to be an array`
    };
  }

  const pass = received.every(item => typeof item === expected);

  return {
    pass,
    message: () =>
      pass
        ? `Expected array not to contain only values of type "${expected}"`
        : `Expected array to contain only values of type "${expected}"`
  };
};

// ============================================================================
// Date Matchers
// ============================================================================

/**
 * Check if date is after another date
 */
const toBeAfter: MatcherFunction = function (received: Date, expected: Date) {
  const pass = received.getTime() > expected.getTime();

  return {
    pass,
    message: () =>
      pass
        ? `Expected ${received.toISOString()} not to be after ${expected.toISOString()}`
        : `Expected ${received.toISOString()} to be after ${expected.toISOString()}`
  };
};

/**
 * Check if date is before another date
 */
const toBeBefore: MatcherFunction = function (received: Date, expected: Date) {
  const pass = received.getTime() < expected.getTime();

  return {
    pass,
    message: () =>
      pass
        ? `Expected ${received.toISOString()} not to be before ${expected.toISOString()}`
        : `Expected ${received.toISOString()} to be before ${expected.toISOString()}`
  };
};

/**
 * Check if date is within range
 */
const toBeWithinRange: MatcherFunction = function (received: Date, start: Date, end: Date) {
  const pass = received.getTime() >= start.getTime() && received.getTime() <= end.getTime();

  return {
    pass,
    message: () =>
      pass
        ? `Expected ${received.toISOString()} not to be within range ${start.toISOString()} - ${end.toISOString()}`
        : `Expected ${received.toISOString()} to be within range ${start.toISOString()} - ${end.toISOString()}`
  };
};

// ============================================================================
// Register all matchers
// ============================================================================

expect.extend({
  // Array matchers
  toContainObjectMatching,
  toHaveLength,
  toContainAll,

  // Object matchers
  toHaveKeys,
  toHaveNestedProperty,

  // Function matchers
  toHaveBeenCalledWithObjectContaining,
  toResolveWith,
  toRejectWithMessage,

  // DOM matchers
  toHaveClass,
  toHaveClasses,
  toBeVisible,
  toHaveAttributeWithValue,

  // Type matchers
  toBeOfType,
  toBeArrayOf,

  // Date matchers
  toBeAfter,
  toBeBefore,
  toBeWithinRange
});

// ============================================================================
// Type Declarations
// ============================================================================

declare global {
  namespace jest {
    interface Matchers<R> {
      // Array matchers
      toContainObjectMatching(expected: Record<string, any>): R;
      toHaveLength(expected: number): R;
      toContainAll(expected: any[]): R;

      // Object matchers
      toHaveKeys(expected: string[]): R;
      toHaveNestedProperty(path: string, value?: any): R;

      // Function matchers
      toHaveBeenCalledWithObjectContaining(expected: Record<string, any>): R;
      toResolveWith(expected: any): Promise<R>;
      toRejectWithMessage(expected: string): Promise<R>;

      // DOM matchers
      toHaveClass(expected: string): R;
      toHaveClasses(expected: string[]): R;
      toBeVisible(): R;
      toHaveAttributeWithValue(attribute: string, value: string): R;

      // Type matchers
      toBeOfType(expected: string): R;
      toBeArrayOf(expected: string): R;

      // Date matchers
      toBeAfter(expected: Date): R;
      toBeBefore(expected: Date): R;
      toBeWithinRange(start: Date, end: Date): R;
    }
  }
}

export {};


