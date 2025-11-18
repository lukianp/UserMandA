/* eslint-env node, jest, browser */
/* eslint-disable @typescript-eslint/no-var-requires */

// Polyfills for Jest test environment
const { TextEncoder, TextDecoder } = require('util');

// TextEncoder/TextDecoder polyfill for Node environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock Electron APIs
const mockElectronAPI = {
  // Direct methods (used by hooks)
  executeModule: jest.fn().mockResolvedValue({ success: true, data: {} }),
  executeScript: jest.fn().mockResolvedValue({ success: true, data: {} }),
  cancelExecution: jest.fn().mockResolvedValue({ success: true }),
  onProgress: jest.fn(() => jest.fn()), // Returns unsubscribe function

  // Nested powershell methods (legacy)
  powershell: {
    executeScript: jest.fn(),
    executeModule: jest.fn(),
    cancel: jest.fn(),
  },
  config: {
    get: jest.fn(),
    set: jest.fn(),
  },
  system: {
    getSystemInfo: jest.fn(),
  },
};

global.electronAPI = mockElectronAPI;

// Also make it available on window for hooks
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
