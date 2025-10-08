// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfills for Jest environment
const { TextEncoder, TextDecoder } = require('util');
Object.assign(global, { TextEncoder, TextDecoder });

// Mock window.electronAPI for testing
global.window.electronAPI = {
  executeScript: jest.fn(),
  executeModule: jest.fn(),
  cancelExecution: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  getConfig: jest.fn(),
  setConfig: jest.fn(),
  onProgress: jest.fn(() => () => {}),
  onOutput: jest.fn(() => () => {}),
} as any;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
