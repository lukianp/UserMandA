// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfills for Jest environment
const { TextEncoder, TextDecoder } = require('util');
Object.assign(globalThis, { TextEncoder, TextDecoder });

// Mock URL.createObjectURL for testing
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-url'),
});

// Mock URL.revokeObjectURL for testing
Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock window.electronAPI for testing
globalThis.window.electronAPI = {
  executeScript: jest.fn(),
  executeModule: jest.fn(),
  cancelExecution: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  getConfig: jest.fn(),
  setConfig: jest.fn(),
  onProgress: jest.fn(() => jest.fn()),
  onOutput: jest.fn(() => jest.fn()),
} as any;

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver implements globalThis.IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}

  observe(target: Element): void {}
  unobserve(target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
